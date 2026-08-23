import {
  HttpInterceptorFn
} from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (
  request,
  next
) => {

  const token = localStorage.getItem('token');

  if (token) {

    const requestConToken = request.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });

    return next(requestConToken);
  }

  return next(request);
};