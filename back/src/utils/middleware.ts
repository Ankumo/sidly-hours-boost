import path from 'path';
import { AppRequest } from 'src/defaults/types';
import { UserRepository } from 'src/modules/User/user.repository';
import { getCustomRepository } from 'typeorm';
import fs from 'fs';
import { Response } from 'express';

const getUser = async (hash: string) => {
    if (!hash) {
        return null;
    }

    const repo = getCustomRepository(UserRepository);
    return await repo.findBySession(hash);
};

export default async (req: AppRequest, res: Response, next: () => void) => {
    if (req.path.startsWith('/api')) {
        req.user = await getUser(req.cookies.session_hash);
        next();
        return;
    }

    const base = path.resolve('./dist/front');

    if (path.extname(req.path) !== '.html') {
        const file = path.join(base, path.normalize(req.path));

        try {
            const stat = await fs.promises.stat(file);

            if (stat.isFile()) {
                res.sendFile(file);
                return;
            }
        } catch {}
    }

    req.user = await getUser(req.cookies.session_hash);

    res.sendFile(path.join(base, `${req.user ? '' : 'login/'}index.html`));
};
