import { applyDecorators, SetMetadata } from '@nestjs/common';
import { AuthPolicy, AUTH_POLICY_KEY } from '../modules/Auth/auth.constants';

export const Auth = (authPolicy: AuthPolicy = AuthPolicy.AUTH) =>
    applyDecorators(SetMetadata(AUTH_POLICY_KEY, authPolicy));

export const RootAuth = () => applyDecorators(Auth(AuthPolicy.ROOT_AUTH));

export const NoAuth = () => applyDecorators(Auth(AuthPolicy.NO_AUTH));

export const Public = () => applyDecorators(Auth(AuthPolicy.ANY));
