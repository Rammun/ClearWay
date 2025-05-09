import {Component, EventEmitter, Output} from '@angular/core';
import {AnnotationType} from '../documents.model';
import {NgClass} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {NgxFileDropModule} from 'ngx-file-drop';
import {FileSelectEvent, FileUpload} from 'primeng/fileupload';

export interface NewAnnotation {
  text?: string;
  image?: string;
}

@Component({
  selector: 'cw-add-annotation-modal',
  templateUrl: './add-annotation-modal.component.html',
  styleUrl: './add-annotation-modal.component.scss',
  imports: [
    NgClass,
    FormsModule,
    NgxFileDropModule,
    FileUpload
  ]
})
export class AddAnnotationModalComponent {

  @Output() closed = new EventEmitter();
  @Output() addAnnotation = new EventEmitter<NewAnnotation>();

  AnnotationType = AnnotationType;

  mode = AnnotationType.Text;
  text = '';
  image = '';
  isBusy = false;

  uploadedFileUrl: string = '';

  close() {
    this.closed.emit();
  }

  setMode(mode: AnnotationType) {
    this.mode = mode;
  }

  onCancel() {
    this.close();
  }

  onAddAnnotation() {
    if (this.mode === AnnotationType.Text) {
      this.addAnnotation.emit({
        text: this.text
      });
    }
    if (this.mode === AnnotationType.Image) {
      this.addAnnotation.emit({
        image: this.uploadedFileUrl
      });
    }
  }

  onSelectedFile($event: FileSelectEvent) {
    this.uploadedFileUrl = URL.createObjectURL($event.files[0]);
  }

}
