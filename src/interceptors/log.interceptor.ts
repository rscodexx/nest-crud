import { CallHandler, ExecutionContext, NestInterceptor } from '@nestjs/common';
import { Observable, tap } from 'rxjs';

export class LogInterceptor implements NestInterceptor {
    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        const date = Date.now();

        return next.handle().pipe(
            tap(() => {
                console.log(`A execução levou: ${Date.now() - date} ms`);
            })
        );
    }
}
