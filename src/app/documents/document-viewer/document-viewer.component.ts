import {Component, DestroyRef, Inject, inject, OnInit} from '@angular/core';
import {AnnotationType, AnnotationViewModel, CwDocumentViewModel} from '../documents.model';
import {DocumentsService} from '../documents.service';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {catchError, EMPTY, finalize, of, Subject, switchMap, tap, throttleTime} from 'rxjs';
import {ActivatedRoute} from '@angular/router';
import {API_REMOTE_SERVICE_URL} from '../../app.config';
import {AddAnnotationModalComponent, NewAnnotation} from '../add-annotation-modal/add-annotation-modal.component';
import {v4 as uuidv4} from 'uuid';
import {Toast} from 'primeng/toast';
import {MessageService} from 'primeng/api';
import {NgClass} from '@angular/common';

class PageActivity {
  page: number = 0;
  left: number = 0;
  top: number = 0;

  constructor(page?: number, left?: number, top?: number) {
    this.page = page ?? 0;
    this.left = left ?? 0;
    this.top = top ?? 0;
  }
}

@Component({
  selector: 'document-viewer',
  standalone: true,
  templateUrl: './document-viewer.component.html',
  styleUrl: './document-viewer.component.scss',
  imports: [
    AddAnnotationModalComponent,
    // CdkDrag,
    Toast,
    NgClass
  ],
  providers: [MessageService]
})
export class DocumentViewerComponent implements OnInit {

  AnnotationType = AnnotationType;

  zoom = 100;
  isBusy = false;
  document: CwDocumentViewModel = new CwDocumentViewModel();
  baseUrl: string = '';
  isAnnotationModalOpened = false;
  pageActivity: PageActivity = new PageActivity();

  private mouseClientX = 0;
  private mouseClientY = 0;
  private startDragging = false;

  private readonly _dragAnnotation$ = new Subject<{ annotation: AnnotationViewModel, $event: MouseEvent }>();
  private readonly _destroyRef = inject(DestroyRef);

  constructor(
    private readonly _activatedRoute: ActivatedRoute,
    private readonly _documentsService: DocumentsService,
    private readonly _messageService: MessageService,
    @Inject(API_REMOTE_SERVICE_URL) _baseUrl: string
  ) {
    this.baseUrl = _baseUrl;
  }

  ngOnInit() {
    const documentId = this._activatedRoute.snapshot.params['id'];
    if (!!documentId) {
      this.getDocument(documentId);
    }

    this._dragAnnotation$
      .pipe(
        throttleTime(5),
        takeUntilDestroyed(this._destroyRef)
      )
      .subscribe(({annotation, $event}) => {
        this.moveAnnotation(annotation, $event);
      });
  }

  onZoomIn() {
    if (this.zoom < 200) {
      this.zoom += 1;
    }
  }

  onZoomOut() {
    if (this.zoom > 10) {
      this.zoom -= 1;
    }
  }

  onSave() {
    console.log('--- Save document', this.document);
    const annotations = this.document.pages
      .flatMap(p => p.annotations)
      .map(a => a.toDto());

    this.isBusy = true;
    this._documentsService.saveAnnotations(this.document.id, annotations)
      .pipe(
        catchError(err => {
          console.log(err);
          return EMPTY;
        }),
        finalize(() => {
          this.isBusy = false;
        }),
        takeUntilDestroyed(this._destroyRef)
      )
      .subscribe(() => {
        this._messageService.add({severity: 'success', summary: 'Annotations saved!'});
      });
  }

  onShowAddAnnotationModal(pageNumber: number, $event: MouseEvent) {
    if (this.isAnnotationModalOpened) {
      return;
    }
    const target = $event.currentTarget as HTMLElement;
    const rect = target.getBoundingClientRect();
    const x = $event.clientX - rect.left;
    const y = $event.clientY - rect.top;
    const xPercent = (x / rect.width) * 100;
    const yPercent = (y / rect.height) * 100;
    this.pageActivity = new PageActivity(pageNumber, xPercent, yPercent);

    this.isAnnotationModalOpened = true;
  }

  onAddAnnotation(annotation: NewAnnotation) {
    const page = this.document.pages.find(p => p.number === this.pageActivity.page);
    if (!page) {
      console.log('Page ' + this.pageActivity.page + ' not found!');
      return;
    }

    if (!!annotation) {
      const annotationVm = new AnnotationViewModel();
      annotationVm.id = uuidv4();
      annotationVm.pageNumber = this.pageActivity.page;
      annotationVm.yPercent = this.pageActivity.top;
      annotationVm.xPercent = this.pageActivity.left;
      annotationVm.type = !!annotation.text?.trim()
        ? AnnotationType.Text
        : !!annotation.image ? AnnotationType.Image : AnnotationType.Unknown;
      annotationVm.text = annotation.text?.trim() ?? '';
      annotationVm.imageUrl = annotation.image ?? '';

      page.annotations.push(annotationVm);
    }

    this.isAnnotationModalOpened = false;
  }

  onDeleteAnnotation(annotation: AnnotationViewModel) {
    const page = this.deleteAnnotationOnPage(annotation);
    if (!page) {
      console.log('Page ' + this.pageActivity.page + ' not found!');
      return;
    }
  }

  // onDragMoved(annotation: AnnotationViewModel, $event: any) {
  //   const nativeElement = $event.source.element.nativeElement as HTMLElement;
  //   const container = nativeElement.parentElement as HTMLElement;
  //   const rect = container.getBoundingClientRect();
  //
  //   const left = nativeElement.offsetLeft + $event.distance.x;
  //   const top = nativeElement.offsetTop + $event.distance.y;
  //   const xPercent = (left / rect.width) * 100;
  //   const yPercent = (top / rect.height) * 100;
  //
  //   // Хак, чтобы удалить стиль transform и сохранить позицию аннотации при масштабировании документа.
  //   const page = this.deleteAnnotationOnPage(annotation);
  //   const replacement = new AnnotationViewModel();
  //   replacement.id = uuidv4();
  //   replacement.pageNumber = annotation.pageNumber;
  //   replacement.xPercent = xPercent;
  //   replacement.yPercent = yPercent;
  //   replacement.type = annotation.type;
  //   replacement.text = annotation.text;
  //   replacement.imageUrl = annotation.imageUrl;
  //   page?.annotations.push(replacement);
  // }

  onStartDragging(annotation: AnnotationViewModel, $event: any) {
    this.startDragging = true;

    const GRAB_DELAY = 300;
    setTimeout(() => {
      if (this.startDragging) {
        this.startDragging = false;

        const annotationEl = $event.target?.parentElement as HTMLElement;
        const parent = annotationEl?.offsetParent as HTMLElement;
        if (!parent) {
          return;
        }
        annotation.element = annotationEl;
        annotation.parentElement = parent;
        const annotationRect = annotation.element.getBoundingClientRect();
        const parentRect = annotation.parentElement.getBoundingClientRect();
        this.mouseClientX = $event.clientX - (annotationRect.left - parentRect.left);
        this.mouseClientY = $event.clientY - (annotationRect.top - parentRect.top);

        annotation.isDragging = true;
      }
    }, GRAB_DELAY);
  }

  onEndDragging(annotation: AnnotationViewModel) {
    this.startDragging = false;
    annotation.isDragging = false;
  }

  onDragAnnotation(annotation: AnnotationViewModel, $event: any) {
    if (!annotation.isDragging) {
      return;
    }

    $event.stopPropagation();
    $event.preventDefault();

    this._dragAnnotation$.next({
      annotation,
      $event
    });
  }

  private getDocument(documentId: number) {
    this.isBusy = true;

    this._documentsService.getDocument(documentId)
      .pipe(
        switchMap(document => {
          if (!document) {
            return EMPTY;
          }
          this.document = CwDocumentViewModel.fromDto(document);
          this.document.id = documentId;

          return this._documentsService.getAnnotations(documentId)
            .pipe(
              tap(annotations => {
                if (!!annotations?.length) {
                  this.document.pages.forEach(page => {
                    page.annotations = annotations
                      .filter(a => a.pageNumber === page.number)
                      .map(a => AnnotationViewModel.fromDto(a));
                  });
                }
              }),
              catchError(err => {
                console.log(err);
                return of([]);
              })
            )
        }),
        catchError(err => {
          console.log(err);
          return EMPTY;
        }),
        finalize(() => {
          this.isBusy = false;
        }),
        takeUntilDestroyed(this._destroyRef)
      )
      .subscribe();
  }

  private deleteAnnotationOnPage(annotation: AnnotationViewModel) {
    const page = this.document.pages?.find(p => p.number === annotation.pageNumber);
    if (!page) {
      return null;
    }
    page.annotations = page.annotations.filter(a => a.id !== annotation.id);
    return page;
  }

  private moveAnnotation(annotation: AnnotationViewModel, $event: MouseEvent) {
    const annotationEl = annotation.element;
    const parentEl = annotation.parentElement;
    if (annotationEl === null || parentEl === null) {
      return;
    }

    const annotationRect = annotationEl.getBoundingClientRect();

    const newX = $event.clientX - this.mouseClientX;
    const newY = $event.clientY - this.mouseClientY;

    const maxX = parentEl.clientWidth - annotationRect.width;
    const maxY = parentEl.clientHeight - annotationRect.height;

    const clampedX = Math.min(Math.max(0, newX), maxX);
    const clampedY = Math.min(Math.max(0, newY), maxY);

    annotation.xPercent = (clampedX / parentEl.clientWidth) * 100;
    annotation.yPercent = (clampedY / parentEl.clientHeight) * 100;
  }

}
