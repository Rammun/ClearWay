import {Inject, Injectable} from '@angular/core';
import {API_REMOTE_SERVICE_URL} from '../app.config';
import {HttpClient} from '@angular/common/http';

export class CwDocumentDto {
  name!: string;
  pages!: DocumentPageDto[];
}

export class DocumentPageDto {
  number!: number;
  imageUrl!: string;
}

export class AnnotationDto {
  id!: string;
  documentId!: number;
  pageNumber!: number;
  type!: string;
  left!: number;
  top!: number;
  text!: string;
  imageUrl!: string;
}

@Injectable({
  providedIn: 'root'
})
export class DocumentsService {
  private readonly _http: HttpClient;
  private readonly _baseUrl: string;

  constructor(
    @Inject(HttpClient) http: HttpClient,
    @Inject(API_REMOTE_SERVICE_URL) baseUrl: string
  ) {
    this._http = http;
    this._baseUrl = baseUrl ?? '';
  }

  getDocuments() {
    const SERVICE_NAME = 'documents';
    const url = `${this._baseUrl}/${SERVICE_NAME}`;

    return this._http.get<CwDocumentDto[]>(url);
  }

  getDocument(documentId: number) {
    const SERVICE_NAME = 'documents';
    const url = `${this._baseUrl}/${SERVICE_NAME}/${documentId}.json`;

    return this._http.get<CwDocumentDto>(url);
  }

  getAnnotations(documentId: number) {
    const SERVICE_NAME = 'annotations';
    const url = `${this._baseUrl}/${SERVICE_NAME}/${documentId}.json`;

    return this._http.get<AnnotationDto[]>(url);
  }

  saveAnnotations() {

  }
}
