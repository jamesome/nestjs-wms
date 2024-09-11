export enum StockStatus {
  NORMAL = 'normal', // 정상
  ABNORMAL = 'abnormal', // 비정상
  DISPOSED = 'disposed', // 폐기
}

export enum Category {
  RECEIVING = 'receiving', // 입고
  SHIPPING = 'shipping', // 출고
  MOVEMENT = 'movement', // 이동
}

// 입력구분
// TODO: 수정필요
export enum InputType {
  WEB_INCOMING = 'Web > 입고',
  WEB_LOCATION_MOVEMENT = 'Web > 로케이션 이동',
  WEB_OUTGOING = 'Web > 출고',
}

// 전표상태
export enum SlipStatus {
  SCHEDULED = 'scheduled', // 작업예정
  RECEIVED = 'received', // 입하완료
  INSPECTED = 'inspected', // 검품완료
  PARTIAL_RECEIVING = 'partial_receiving', // 부분입고진행
  PARTIAL_IN_STOCK = 'partial_in_stock', // 부분입고완료
  RETURNED = 'returned', // 반품완료
  IN_STOCK = 'in_stock', // 입고완료
  IN_TRANSIT = 'in_transit', // 이동중
  TRANSFERRED = 'transferred', // 이동완료
  ALLOCATED = 'allocated', // 할당완료
  PICKING = 'picking', // 피킹중
  PICKING_FAILURE = 'picking_failure', // 피킹실패
  PICKED = 'picked', // 피킹완료
  PACKED = 'packed', // 패킹완료
  SHIPPED = 'shipped', // 출고완료
  CANCELED = 'canceled', // 취소완료
}

// 웨이브 상태
export enum WaveStatus {
  NEW = 'new', // 신규(웨이브 취소 가능 상태)
  IN_PROGRESS = 'in_progress', // 작업중
  COMPLETED = 'completed', // 완료
}

// 재고할당 룰
export enum StockAllocationMethod {
  FEFO = 'fefo', // 선 만료 선출법(First-Expired-First-Out)
  LPR = 'lpr', // 공간 최적화 할당(Least packages removal)
}

// 존 포함, 제외
export enum ZoneFilter {
  INCLUDE = 'include', // 포함
  EXCLUDE = 'exclude', // 제외
}
