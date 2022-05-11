import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanDeactivate, RouterStateSnapshot } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Observable, Subject, from, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ConfirmLeaveComponent } from '../shared/components/confirm-leave/confirm-leave.component';

export interface DeactivateComponent {
  canExit: () => Observable<boolean> | boolean;
}

@Injectable({
  providedIn: 'root'
})
export class DeactivateGuardService implements CanDeactivate<DeactivateComponent> {
  component: DeactivateComponent;
  route: ActivatedRouteSnapshot;

  constructor(private modalService: NgbModal) { }

  canDeactivate(component: DeactivateComponent, route: ActivatedRouteSnapshot, state: RouterStateSnapshot,
    nextState: RouterStateSnapshot): Observable<boolean> | boolean {

    if (!component.canExit()) {
      const subject = new Subject<boolean>();
      const modal = this.modalService.open(ConfirmLeaveComponent, { backdrop: 'static' });

      return from(modal.result).pipe(
        catchError(error => {
          console.warn(error);
          return of(undefined);
        })
      );
    }

    return true;
  }
}
