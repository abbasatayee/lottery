export interface PermissionStatus {
  isSupported: boolean;
  isGranted: boolean;
  isDenied: boolean;
  isPrompt: boolean;
  canRequest: boolean;
}

export const checkGeolocationSupport = (): boolean => {
  return "geolocation" in navigator;
};

export const checkPermissionStatus = async (): Promise<PermissionStatus> => {
  const isSupported = checkGeolocationSupport();

  if (!isSupported) {
    return {
      isSupported: false,
      isGranted: false,
      isDenied: false,
      isPrompt: false,
      canRequest: false,
    };
  }

  // Check if Permissions API is supported
  if ("permissions" in navigator && navigator.permissions) {
    try {
      const permissionStatus = await navigator.permissions.query({
        name: "geolocation" as PermissionName,
      });

      return {
        isSupported: true,
        isGranted: permissionStatus.state === "granted",
        isDenied: permissionStatus.state === "denied",
        isPrompt: permissionStatus.state === "prompt",
        canRequest: permissionStatus.state === "prompt",
      };
    } catch (error) {
      console.log("Permissions API not supported, assuming prompt state");
    }
  }

  // If Permissions API is not supported, assume we can request
  return {
    isSupported: true,
    isGranted: false,
    isDenied: false,
    isPrompt: true,
    canRequest: true,
  };
};

export const requestGeolocationPermission =
  (): Promise<GeolocationPosition> => {
    return new Promise((resolve, reject) => {
      if (!checkGeolocationSupport()) {
        reject(new Error("مرورگر شما از این قابلیت پشتیبانی نمی‌کند"));
        return;
      }

      if (!navigator.geolocation || !navigator.geolocation.getCurrentPosition) {
        reject(new Error("مرورگر شما از این قابلیت پشتیبانی نمی‌کند"));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          console.log("Location obtained:", position);
          resolve(position);
        },
        (error) => {
          console.error("Location error:", error);
          let errorMessage = "خطا در دریافت مجوزها";

          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage =
                "دسترسی به مجوزها توسط کاربر رد شد. لطفاً در تنظیمات مرورگر اجازه دهید.";
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage =
                "اطلاعات در دسترس نیست. لطفاً تنظیمات دستگاه خود را بررسی کنید.";
              break;
            case error.TIMEOUT:
              errorMessage = "درخواست منقضی شد. لطفاً دوباره تلاش کنید.";
              break;
            default:
              errorMessage = "خطای ناشناخته در دریافت مجوزها رخ داد.";
              break;
          }

          reject(new Error(errorMessage));
        },
        {
          enableHighAccuracy: true, // Force GPS usage
          timeout: 60000, // 60 seconds for GPS
          maximumAge: 0, // Always get fresh GPS data
        }
      );
    });
  };

export const getPermissionInstructions = (
  status: PermissionStatus
): string[] => {
  if (!status.isSupported) {
    return [
      "مرورگر شما از GPS پشتیبانی نمی‌کند",
      "لطفاً از مرورگر دیگری استفاده کنید",
      "Chrome، Firefox یا Safari را امتحان کنید",
      "مطمئن شوید که GPS دستگاه فعال است",
    ];
  }

  if (status.isDenied) {
    return [
      "دسترسی به GPS رد شده است",
      "در تنظیمات مرورگر خود مجوز GPS را فعال کنید",
      "برای Chrome: Settings > Privacy and security > Site settings > Location",
      "برای Firefox: Settings > Privacy & Security > Permissions > Location",
    ];
  }

  if (status.isPrompt) {
    return [
      'وقتی پنجره مجوز ظاهر شد، روی "اجازه" کلیک کنید',
      "مطمئن شوید که GPS دستگاه شما فعال است",
      "برای دقت بهتر، در فضای باز باشید",
      "VPN را غیرفعال کنید",
      "برای سیگنال بهتر، به فضای باز بروید",
    ];
  }

  return [
    "GPS فعال است",
    "برای دقت بهتر، در فضای باز باشید",
    "VPN را غیرفعال کنید",
  ];
};
