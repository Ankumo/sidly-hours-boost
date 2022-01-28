import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AppRequest } from 'src/defaults/types';
import { AuthPolicy, AUTH_POLICY_KEY } from './auth.constants';
import { AuthService } from './auth.service';

@Injectable()
export class AuthGuard implements CanActivate {
    constructor(private reflector: Reflector, private service: AuthService) {}

    canActivate(context: ExecutionContext) {
        const req: AppRequest = context.switchToHttp().getRequest();

        const authPolicy = this.reflector.getAllAndOverride<AuthPolicy>(
            AUTH_POLICY_KEY,
            [context.getHandler(), context.getClass()],
        );

        switch (authPolicy) {
            case AuthPolicy.NO_AUTH:
                return !req.user;
            case AuthPolicy.ROOT_AUTH:
                return req.user && req.user.isRoot;
            case undefined:
            case AuthPolicy.AUTH:
                return !!req.user;
        }

        return true;
    }
}
