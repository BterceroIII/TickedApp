import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction } from 'express';
import { RequestContext } from '../utils/request.context';


interface UserRequest extends Request {
  user: {
    id: string;
  };
}

@Injectable()
export class RequestContextMiddleware implements NestMiddleware {
  use(req: UserRequest, res: Response, next: NextFunction) {
    // Start a new AsyncLocalStorage context for each request
    RequestContext.run(() => {
      if (req.user && req.user.id) {
        RequestContext.set('userId', req.user.id.toString());
      }
      next();
    });
  }
}
