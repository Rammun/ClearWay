import {AnnotationDto, CwDocumentDto, DocumentPageDto} from './documents.service';

export class CwDocumentViewModel {
  name: string = '';
  pages: CwDocumentPageViewModel[] = [];

  static fromDto(dto: CwDocumentDto): CwDocumentViewModel {
    const vm = new CwDocumentViewModel();
    vm.name = dto?.name ?? 'Noname';
    vm.pages = dto?.pages?.map(pageDto => CwDocumentPageViewModel.fromDto(pageDto)) ?? [];

    return vm;
  }
}

export class CwDocumentPageViewModel {
  number: number = 0;
  imageUrl: string = '';
  annotations: AnnotationViewModel[] = [];

  static fromDto(dto: DocumentPageDto): CwDocumentPageViewModel {
    const vm = new CwDocumentPageViewModel();
    vm.number = dto?.number ?? 0;
    vm.imageUrl = dto?.imageUrl ?? '';

    return vm;
  }
}

export class AnnotationViewModel {
  id: string = '';
  pageNumber: number = 0;
  type: AnnotationType = AnnotationType.Text;
  xPercent: number = 0;
  yPercent: number = 0;
  text: string = '';
  imageUrl: string = '';

  static fromDto(dto: AnnotationDto): AnnotationViewModel {
    const vm = new AnnotationViewModel();
    vm.id = dto?.id ?? '';
    vm.pageNumber = dto?.pageNumber ?? 0;
    vm.type = dto?.type == null
      ? AnnotationType.Text
      : AnnotationType[dto.type as keyof typeof AnnotationType];
    vm.xPercent = dto?.left ?? 0;
    vm.yPercent = dto?.top ?? 0;
    vm.text = dto?.text ?? '';
    vm.imageUrl = dto?.imageUrl ?? '';

    return vm;
  }
}

export enum AnnotationType {
  Text = 'text',
  Image = 'image',
  Unknown = 'unknown',
}
