// MOST Web Framework 2.0 Codename Blueshift, Copyright (c) 2020 THEMOST LP, All rights reserved
import {TextUtils,LangUtils} from '@themost/common';
import {AuthStrategy} from '@themost/web';
import * as moment from 'moment';
import { ExpressDataContext } from '@themost/express';

export class InvalidClientError extends Error {
    public code: string;
    constructor(msg?: string) {
        super(msg || "Invalid or outdated client data.");
        this.code = "E_CLIENT";
    }
}

export class InvalidScopeError extends Error {
    public code: string;
    constructor(msg?: string) {
        super(msg || "Request has one or more invalid or unknown scopes.");
        this.code = "E_SCOPE";
    }
}

export class InvalidCredentialsError extends Error {
    public code: string;
    constructor(msg?: string) {
        super(msg || "Unknown username or bad password.");
        this.code = "E_CREDENTIALS";
    }
}

export class LoginService {

    private _context: ExpressDataContext;
    private _client_id: any;
    private _scope: any;
    
    constructor(context: ExpressDataContext, client_id: string, scope: string) {
        this._context = context;
        this._client_id = client_id;
        this._scope = scope || 'profile';
    }

    get context() {
        return this._context;
    }

    get scope() {
        return this._scope;
    }

    get client() {
        return this._client_id;
    }

    private async validateUser(username: string, password: string) {
        const user = await this.context.model('User').silent()
            .where('name').equal(username)
            .select('id','name')
            .getItem();
        if (user == null) {
            return;
        }
        const exists = await this.context.model('UserCredential')
                .silent()
                .where('userPassword').equal('{clear}'.concat(password))
                .or('userPassword').equal('{md5}' + TextUtils.toMD5(password))
                .or('userPassword').equal('{sha1}' + TextUtils.toSHA1(password))
                .prepare()
                .and('id').equal(user.id).count();
        if (exists)  {
            return user;
        }
    }

    async login(userName: string, userPassword: string) {
        // get client
        const client = await this.context.model('AuthClient').silent().where('client_id').equal(this.client).getItem();
        // throw error if client is null
        if (client == null) {
            throw new InvalidClientError();
        }
        // split the given scopes
        const scopes = this.scope.split(' ');
        // get auth scopes
        const returnedScopes = await this.context.model('AuthScope').where('name').equal(scopes).silent().cache(true).getItems();
        // validate that all the given scopes exist
        if (returnedScopes.length!==scopes.length) {
            throw new InvalidScopeError();
        }
        // validate username and password
        const user = await this.validateUser(userName, userPassword);
        // throw error for invalid credentials
        if (user == null) {
            throw new InvalidCredentialsError();
        }
        // get expiration timeout
        const expirationTimeout = (LangUtils.parseInt(this.context.getApplication().getConfiguration().settings.auth['timeout']) || 480)*60*1000;
        //calculate expiration time
        const expires = moment(new Date()).add(expirationTimeout, 'ms').toDate();
        //get access tokens model
        const accessTokens = this.context.model('AccessToken');
        //create new token (for the specified client)
        const token = {
            client_id: this.client,
            user_id: user.name,
            expires: expires,
            scope: this.scope
        };
        const accessToken = await accessTokens.where('client_id').equal(this.client)
            .and('user_id').equal(user.name)
            .and('expires').greaterThan(new Date()).silent()
            .and('scope').equal(this.scope)
            .getTypedItem();
        if (accessToken) {
            this.context.getApplication().getStrategy(AuthStrategy).setAuthCookie(<any>this.context, user.name);
            accessToken.expires = moment(accessToken.expires).toDate();
            return accessToken;
        }
        await accessTokens.silent().save(token);
        this.context.getApplication().getStrategy(AuthStrategy).setAuthCookie(<any>this.context, user.name);
        return token;
    }

    async logout() {
        this.context.getApplication().getStrategy(AuthStrategy).setAuthCookie(<any>this.context, 'anonymous', { expires: new Date(1970, 1, 1) });
    }
}

