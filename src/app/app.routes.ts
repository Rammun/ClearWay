import {Routes} from '@angular/router';
import {DocumentsComponent} from './documents/documents.component';
import {DocumentViewerComponent} from './documents/document-viewer/document-viewer.component';

export const ROOT_ROUTES: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: '/documents'
  },
  {
    path: 'documents',
    component: DocumentsComponent
  },
  {
    path: 'documents/:id',
    component: DocumentViewerComponent
  },
  {
    path: '**',
    redirectTo: '/documents'
  }
];
