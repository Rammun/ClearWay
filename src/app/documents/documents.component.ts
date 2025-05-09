import {Component} from '@angular/core';
import {RouterLink} from '@angular/router';

@Component({
  standalone: true,
  templateUrl: './documents.component.html',
  imports: [
    RouterLink
  ],
  styleUrl: './documents.component.scss'
})
export class DocumentsComponent {

  documents = [
    {
      id: 1,
      name: 'Test Doc'
    },
    {
      id: 2,
      name: 'Test Doc 2'
    }
  ];

}
