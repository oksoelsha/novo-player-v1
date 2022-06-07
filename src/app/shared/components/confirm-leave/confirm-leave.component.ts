import { ChangeDetectionStrategy, Component } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-confirm-leave',
  templateUrl: './confirm-leave.component.html',
  styleUrls: ['./confirm-leave.component.sass'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ConfirmLeaveComponent {

  constructor(private modal: NgbActiveModal ) { }

  action(value: boolean) {
    this.modal.close(value);
  }
}
