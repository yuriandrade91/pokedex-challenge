import {
  HttpInterceptorFn,
  HttpHandlerFn,
  HttpRequest,
  HttpErrorResponse,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, finalize } from 'rxjs';
import { HTTP_STATUS_MESSAGES } from '../../shared/constants/http-status-messages';
import { LoadingService } from '../services/loading.service';

export const basicInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
) => {
  const loadingService = inject(LoadingService);

  loadingService.show();

  const cloned = req.clone({
    setHeaders: {
      'X-App-Interceptor': 'active',
    },
  });

  return next(cloned).pipe(
    catchError((error: HttpErrorResponse) => {
      console.error('Erro capturado no interceptor:', {
        status: error.status,
        url: req.url,
        method: req.method,
        error,
      });

      if (error.status) {
        const msg = HTTP_STATUS_MESSAGES[error.status] || `Erro ${error.status}: ${error.message}`;
        alert(msg);
      } else {
        console.error('Erro de conexão:', error);
        alert('Erro de conexão com o servidor');
      }

      throw error;
    }),

    finalize(() => {
      loadingService.hide();
    })
  );
};
