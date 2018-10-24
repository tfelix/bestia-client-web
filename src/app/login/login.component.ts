import { Component, OnInit } from '@angular/core';

import { ModalService } from 'app/modal.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  constructor(
    private modalService: ModalService
  ) { }

  ngOnInit() {
    this.modalService.open('login-dialog');
  }

  openModal(id: string) {
    this.modalService.open(id);
  }

  closeModal(id: string) {
    this.modalService.close(id);
  }
}
