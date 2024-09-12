/* DO NOT EDIT, file generated by nestjs-i18n */
  
/* eslint-disable */
/* prettier-ignore */
import { Path } from "nestjs-i18n";
/* prettier-ignore */
export type I18nTranslations = {
    "test": {
        "HELLO": string;
        "PRODUCT": {
            "NEW": string;
        };
        "ENGLISH": string;
        "ARRAY": [
            string,
            string,
            string
        ];
        "cat": string;
        "cat_name": string;
        "set-up-password": {
            "heading": string;
            "title": string;
            "followLink": string;
        };
        "day_interval": {
            "one": string;
            "other": string;
            "zero": string;
        };
        "nested": string;
    };
    "database": {
        "DUPLICATE_ENTRY": string;
    };
    "error": {
        "INTERNAL_SERVER_ERROR": string;
        "LOT_ID_MISMATCH": string;
        "STATUS_MISMATCH": string;
        "ENTITY_NOT_FOUND": string;
        "CANNOT_DELETE_DUE_TO_DEFAULT_VALUE": string;
        "CANNOT_DELETE_DUE_TO_ASSOCIATED_ITEMS": string;
        "CANNOT_DELETE_WAVE": string;
        "STOCK_SHORTAGE": string;
        "fields": {
            "itemId": string;
            "itemCode": string;
            "locationName": string;
            "locationDepartureName": string;
            "locationArrivalName": string;
            "supplier": string;
            "supplierName": string;
            "lotNumber": string;
            "operationTypeName": string;
            "quantity": string;
        };
        "rules": {
            "IS_NOT_EMPTY": string;
            "NOT_EXIST": string;
            "ALREADY_EXIST": string;
            "NOT_EXIST_FOR_MOVING": string;
            "NOT_ENOUGH": string;
        };
    };
    "validation": {
        "EXAMPLE": string;
        "fields": {
            "Warehouse": {
                "name": string;
                "code": string;
                "postCode": string;
                "address": string;
                "detailAddress": string;
                "manager": string;
                "contact": string;
            };
            "Zone": {
                "name": string;
                "code": string;
                "remark": string;
                "warehouseId": string;
            };
            "Location": {
                "name": string;
                "remark": string;
                "zoneId": string;
                "warehouseId": string;
            };
            "Item": {
                "name": string;
                "property": string;
                "zoneId": string;
                "warehouseId": string;
                "itemCodes": string;
            };
            "ItemCode": {
                "code": string;
            };
            "Lot": {
                "itemId": string;
                "supplierId": string;
                "number": string;
                "expirationDate": string;
            };
            "Supplier": {
                "name": string;
            };
            "InventoryItem": {
                "itemId": string;
                "locationId": string;
                "locationDepartureId": string;
                "locationArrivalId": string;
                "lotId": string;
                "lotNo": string;
                "expirationDate": string;
                "operationTypeId": string;
                "status": string;
                "quantity": string;
            };
            "ItemSerial": {
                "serialNo": string;
            };
            "OperationType": {
                "category": string;
                "name": string;
            };
            "Transaction": {
                "category": string;
                "inputType": string;
                "status": string;
                "slipNumber": string;
                "endDate": string;
                "ordersToProcess": string;
            };
            "ShippingTransaction": {
                "slipNumber": string;
                "status": string;
                "order": string;
                "items": string;
            };
            "TransactionItem": {
                "itemId": string;
                "locationDepartureId": string;
                "locationArrivalId": string;
                "operationTypeId": string;
                "supplierId": string;
                "quantity": string;
            };
            "TransactionZone": {
                "zoneId": string;
                "transactionId": string;
            };
            "TransactionB2cOrder": {
                "number": string;
                "shopName": string;
                "recipient": string;
                "contact": string;
                "postCode": string;
                "address": string;
                "detailAddress": string;
                "invoiceNumber": string;
                "orderedAt": string;
            };
            "quantity": string;
            "Wave": {
                "name": string;
                "sequence": string;
                "shipperId": string;
                "ordersPerWave": string;
                "ordersToProcess": string;
            };
            "WaveTransaction": {
                "waveId": string;
                "transactionId": string;
            };
            "StockAllocationRule": {
                "name": string;
                "method": string;
                "zoneFilter": string;
            };
            "Paginate": {
                "page": string;
                "limit": string;
            };
        };
        "rules": {
            "IsNotEmpty": string;
            "IsString": string;
            "IsInt": string;
            "MaxLength": string;
            "Length": string;
            "IsDate": string;
            "Min": string;
            "MaxDateRange": string;
            "IsEnum": string;
        };
    };
};
/* prettier-ignore */
export type I18nPath = Path<I18nTranslations>;
