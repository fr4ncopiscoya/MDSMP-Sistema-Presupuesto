import { Component, OnInit } from '@angular/core';
import { createMask } from '@ngneat/input-mask';

@Component({
  selector: 'app-gestion-periodos-crear',
  templateUrl: './gestion-periodos-crear.component.html',
  styleUrls: ['./gestion-periodos-crear.component.css']
})
export class GestionPeriodosCrearComponent implements OnInit {

  dataResult: any;

  constructor() { }

  ngOnInit(): void {
  }

  getMaxDate(): string {
    return new Date().toISOString().split('T')[0];
  }

  validarNumero(event: any): void {
    const keyCode = event.keyCode;
    if (keyCode < 48 || keyCode > 57) {
      event.preventDefault();
    }
  }

  currencyInputMask = createMask({
    alias: 'numeric',
    groupSeparator: ',',
    digits: 2,
    digitsOptional: false,
    prefix: 'S/. ',
    placeholder: '0',
  });

}
