import { BarcodeScanner, BarcodeFormat } from '@capacitor-mlkit/barcode-scanning';
import { Capacitor } from '@capacitor/core';
import type { IProduct } from '@/entities/product';
import { getProductByBarcode } from '../api/openFoodFactsApi';
import { mapOpenFoodFactsToProduct } from '../model/mappers';

export function useBarcodeScanner() {
  const scanning = ref(false);
  const scanError = ref<string | null>(null);
  const isNative = Capacitor.isNativePlatform();

  const scan = async (): Promise<IProduct | null> => {
    scanError.value = null;

    if (!isNative) {
      scanError.value = 'Сканирование доступно только в мобильном приложении';
      return null;
    }

    try {
      scanning.value = true;

      const { camera } = await BarcodeScanner.requestPermissions();
      if (camera !== 'granted' && camera !== 'limited') {
        scanError.value = 'Нет доступа к камере';
        return null;
      }

      const { barcodes } = await BarcodeScanner.scan({
        formats: [BarcodeFormat.Ean13, BarcodeFormat.Ean8, BarcodeFormat.UpcA, BarcodeFormat.UpcE],
      });

      if (!barcodes.length) return null;

      const rawValue = barcodes[0]?.rawValue;
      if (!rawValue) return null;

      const dto = await getProductByBarcode(rawValue);
      if (!dto) {
        scanError.value = 'Продукт не найден';
        return null;
      }

      return mapOpenFoodFactsToProduct(dto);
    } catch {
      scanError.value = 'Ошибка сканирования';
      return null;
    } finally {
      scanning.value = false;
    }
  };

  return { scan, scanning, scanError, isNative };
}
