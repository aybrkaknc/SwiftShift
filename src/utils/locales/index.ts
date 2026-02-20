/**
 * i18n Locale Files
 * EN ve TR çevirileri. Tüm UI metinleri burada tanımlanır.
 */

export const en = {
    appName: "SwiftShift",

    // === WELCOME FLOW ===
    welcome: {
        betaBadge: "v0.6.0 Beta",
        title: "SwiftShift",
        subtitle: "Zero-friction content transfer to Telegram.\nConnect your bot, select destinations, and start shifting.",
        getStarted: "Get Started",
        sourceCode: "Source Code"
    },
    tutorial: {
        step1: {
            title: "Create Your Postman",
            description: "Bots are message carriers in Telegram. @BotFather is the father of all bots. Let's ask him for one.",
            actionOpen: "Open BotFather",
            actionCopy: "Copy /newbot",
            guide: "How? Click Start when BotFather opens, send the /newbot command, name your bot, and save the TOKEN given to you."
        },
        step2: {
            title: "Open the Gates",
            description: "For your bot to leave messages, you must make it an Administrator in the target channel or group.",
            subStep1: "Go to your channel or group's Info screen.",
            subStep2: "Go to Administrators > Add Admin.",
            subStep3: "Search for your bot, select it, and Save (ensure Post Messages is on)."
        },
        step3: {
            title: "Fill Address Book",
            description: "SwiftShift needs to know where to send messages. The easiest way is using Telegram Web.",
            recommended: "Recommended Method",
            recTitle: "Add via Telegram Web",
            recDesc: "Right-click on your chat in Telegram Web and select Add to SwiftShift.",
            openWeb: "Open Telegram Web",
            alternative: "Alternative",
            altTitle: "Manual Add",
            altDesc: "After setup, click the (+) button in the panel to add via Chat ID.",
            hint: "You can copy Chat ID from the URL (e.g. -100xxxxx)."
        },
        nav: {
            back: "Back",
            continue: "Continue",
            finish: "Finish"
        }
    },
    nameInput: {
        title: "What should we call you?",
        subtitle: "We ask to personalize your experience.",
        placeholder: "Your Name...",
        continue: "Continue"
    },
    connect: {
        title: "Connect Bot",
        subtitle: "Enter the token you got from BotFather.",
        label: "Bot Token",
        placeholder: "123456:ABC-DEF1234ghIkl...",
        button: "Connect",
        connecting: "Connecting..."
    },
    success: {
        title: "You're Ready!",
        description: "Connected as {botName}.\nYou can now start shifting content rapidly.",
        buttonEmbedded: "Open Dashboard",
        buttonStandalone: "Close Setup"
    },

    // === DASHBOARD ===
    dashboard: {
        greeting: "Hello, {name}",
        addChat: "Add Chat",
        reloadList: "Reload List",
        logout: "Logout",
        searchPlaceholder: "Quick search...",
        noDestinations: "No destinations added",
        noDestinationsHint: "Click + to add a chat manually.",
        sectionPersonal: "Personal",
        sectionChannels: "Channels & Groups",
        sectionOrphans: "Other Topics",
        sentTo: "Sent to {name}",
        resentTo: "Resent to {name}",
        sendError: "Error: {error}",
        resendError: "Resend Error: {error}",
        sentSuccess: "Sent Successfully",
        failedToSend: "Failed to Send",
        resentSuccess: "Resent Successfully",
        failedToResend: "Failed to Resend",
        unknownError: "Unknown Error",
        channelsUpdated: "Channels updated",
        recentsUpdated: "Recents updated",
        logsUpdated: "Logs updated",
        botWarning: "Bot warning: {error}"
    },

    // === ADD DESTINATION MODAL ===
    addModal: {
        title: "Add Destination",
        labelChatId: "Chat ID or URL",
        placeholderChatId: "-100... or web.telegram.org/...",
        labelName: "Display Name",
        placeholderName: "My Channel",
        validationError: "Required fields are missing!",
        cancel: "Cancel",
        add: "Add"
    },

    // === CONFIRM MODAL ===
    confirmModal: {
        cancel: "Cancel",
        clearRecents: "Clear Recents?",
        clearLogs: "Clear Logs?",
        clearRecentsMsg: "This action cannot be undone. All recorded recents will be permanently deleted.",
        clearLogsMsg: "This action cannot be undone. All recorded logs will be permanently deleted.",
        clearAll: "Clear All"
    },

    // === TABS ===
    tabs: {
        channels: "Channels",
        recents: "Recents",
        logs: "Logs"
    },

    // === RECENTS VIEW ===
    recents: {
        noRecents: "No recent sends",
        noRecentsHint: "Your recent sends will appear here.",
        history: "History",
        clearAll: "Clear All",
        recentsCleared: "Recents history cleared"
    },

    // === LOGS VIEW ===
    logs: {
        noLogs: "No logs available",
        noLogsHint: "Operation history will appear here.",
        systemLogs: "System Logs",
        clearAll: "Clear All",
        logsCleared: "System logs cleared",
        target: "Target:",
        details: "Technical Details",
        noDetails: "No technical details available."
    },

    // === TARGET LIST ITEM (Tooltips) ===
    targetItem: {
        unpin: "Unpin",
        pinToTop: "Pin to top",
        pin: "Pin",
        rename: "Rename",
        remove: "Remove",
        sendCurrent: "Send Current",
        send: "Send",
        delete: "Delete",
        resend: "Resend"
    },

    // === RECENT ITEM CARD ===
    recentCard: {
        interactiveLocation: "Interactive Location",
        uncompressedFile: "Uncompressed File",
        audioFile: "Audio File",
        imageUnavailable: "Image unavailable"
    },

    // === RECENT ITEM DETAIL ===
    recentDetail: {
        resend: "Resend",
        openInMaps: "Open in Maps",
        copyLink: "Copy Link",
        copy: "Copy",
        originalQualityDoc: "Original Quality Document",
        nativeAudioContent: "Native Audio Content"
    },

    // === ERROR BOUNDARY ===
    errorBoundary: {
        title: "Something went wrong",
        message: "An unexpected error occurred. Please try again or reload the extension.",
        tryAgain: "Try Again",
        reload: "Reload"
    },

    // === VIEW MODE ===
    viewMode: {
        compact: "Compact View",
        bento: "Bento View",
        gallery: "Gallery View"
    },

    // === BACKGROUND (Service Worker) ===
    background: {
        extensionEvent: "System: Extension {reason}",
        browserStartup: "System: Browser startup initialization",
        regionSent: "Region Sent!",
        regionFailed: "Region Failed",
        regionSentTo: "Sent to {name}",
        regionCapturedSent: "Region captured and sent to {name}",
        regionCaptureFailed: "Region capture failed: {error}",
        regionCaptureError: "Region Capture Error",
        regionCaptureErrorMsg: "Could not capture region.",
        regionCaption: "\u2702\ufe0f Region Capture\n{title}\n{url}",
        regionPreview: "\u2702\ufe0f Region: {title}",
        connectionError: "Connection Error",
        connectionErrorMsg: "Please refresh the page to use SwiftShift properly.",
        noTargetFound: "No Target Found",
        noTargetFoundMsg: "Please select a default target in the extension popup.",
        quickSendTriggered: "Quick Send Triggered (Alt+Q)",
        quickSent: "Quick Sent: {text}...",
        quickSendFailed: "Quick Send Failed: {error}"
    },

    // === CONTEXT MENU ===
    contextMenu: {
        rebuilding: "Rebuilding context menus (v0.4.0)...",
        allTargets: "\ud83d\udcc2 All Targets",
        noTargets: "\u26a0\ufe0f No targets found. Open extension to add one.",
        addToSwiftShift: "\u2795 Add to SwiftShift",
        setupRequired: "\u26a0\ufe0f Setup Required (Click Extension Icon)",
        sendTextTo: "\u26a1 Send Text to {name}",
        sendLinkTo: "\u26a1 Send Link to {name}",
        sendImageTo: "\u26a1 Send Image to {name}",
        sendPageTo: "\u26a1 Send Page to {name}",
        smartSend: "\ud83d\ude80 Smart Send (Auto)",
        sendAsPhoto: "\ud83d\uddbc\ufe0f Send as Photo (Compressed)",
        sendAsFile: "\ud83d\udcc4 Send as File (Uncompressed)",
        captureAndSend: "\ud83d\udcf7 Capture Full Page",
        built: "Context Menu v0.4.0 built.",
        builtDetails: "{pinned} pinned, {total} total."
    },

    // === CLICK HANDLER (Notifications & Logs) ===
    clickHandler: {
        sentTo: "Sent to {name}",
        failedSend: "Failed: {error}"
    },

    // === CAPTURE HANDLER ===
    capture: {
        noBot: "Bot connection not found.",
        regionUnavailable: "Region selection is not available on this page.",
        captureSent: "Capture Sent!",
        captureFailed: "Capture Failed",
        sentToCompressed: "Sent to {name} (Compressed)",
        sentToUncompressed: "Sent to {name} (Uncompressed)",
        captureError: "Capture Error",
        captureErrorMsg: "Cannot capture this page. Does not work on chrome:// or restricted pages.",
        captureFailedLog: "Page capture failed"
    },

    // === DESTINATION HANDLER ===
    destination: {
        error: "Error",
        cannotDetectPage: "Could not detect current page.",
        setupRequired: "Setup Required",
        setupRequiredMsg: "Please connect your bot first.",
        cannotDetectChatId: "Could not detect Chat ID from URL.",
        alreadyExists: "Already Exists",
        alreadyExistsMsg: "This chat is already in your destinations.",
        addedToSwiftShift: "Added to SwiftShift!"
    },

    // === TELEGRAM ERRORS ===
    telegramErrors: {
        chatNotFound: "Chat not found. The bot may not have access.",
        topicNotFound: "Topic not found. It may have been deleted.",
        badRequest: "Bad request. Please check your input.",
        invalidToken: "Invalid bot token. Please reconfigure.",
        blocked: "Bot was blocked or lacks permissions.",
        rateLimit: "Rate limited. Please wait and try again.",
        unknown: "An unknown error occurred."
    }
};

export const tr = {
    appName: "SwiftShift",

    // === WELCOME FLOW ===
    welcome: {
        betaBadge: "v0.6.0 Beta",
        title: "SwiftShift",
        subtitle: "Telegram'a içerik göndermenin en akıcı yolu.\nBotunuzu bağlayın, hedeflerinizi seçin ve paylaşmaya başlayın.",
        getStarted: "Başlayalım",
        sourceCode: "Kaynak Kod"
    },
    tutorial: {
        step1: {
            title: "Kendi Postacınızı Yaratın",
            description: "Telegram'da botlar mesaj taşıyan araçlardır. @BotFather tüm botların babasıdır. Ondan bir tane isteyelim.",
            actionOpen: "BotFather'ı Aç",
            actionCopy: "/newbot Kopyala",
            guide: "Nasıl Yapılır? BotFather açıldığında Başlat'a basın, kopyaladığınız /newbot komutunu gönderin. Botunuza bir isim verin ve size verilen TOKEN'ı kaydedin."
        },
        step2: {
            title: "Kapıları Açın",
            description: "Botunuzun mesaj bırakabilmesi için, onu hedef kanal veya gruba Yönetici (Admin) yapmalısınız.",
            subStep1: "Hedef kanal veya grubunuzun Bilgi ekranına girin.",
            subStep2: "Yöneticiler > Yönetici Ekle yolunu izleyin.",
            subStep3: "Botunuzu aratıp seçin ve Kaydet diyerek yetkilendirin (Mesaj Gönder açık olmalı)."
        },
        step3: {
            title: "Adres Defterini Doldur",
            description: "SwiftShift nereye mesaj atacağını bilmeli. En kolay yol Telegram Web kullanmaktır.",
            recommended: "Önerilen Yöntem",
            recTitle: "Telegram Web ile Ekle",
            recDesc: "Web üzerinde kanalınıza Sağ Tıklayın ve Add to SwiftShift seçeneğini seçin.",
            openWeb: "Telegram Web'i Aç",
            alternative: "Alternatif",
            altTitle: "Manuel Ekleme",
            altDesc: "Kurulum bittikten sonra paneldeki (+) butonuna basarak Chat ID ile ekleme yapabilirsiniz.",
            hint: "Chat ID'yi Telegram Web linkinden (örn: -100xxxxx) kopyalayabilirsiniz."
        },
        nav: {
            back: "Geri",
            continue: "Devam Et",
            finish: "Tamamladım"
        }
    },
    nameInput: {
        title: "Size nasıl hitap edelim?",
        subtitle: "Deneyimi kişiselleştirmek için isminizi rica ediyoruz.",
        placeholder: "İsminiz...",
        continue: "Devam Et"
    },
    connect: {
        title: "Botu Bağla",
        subtitle: "BotFather'dan aldığınız token'ı girin.",
        label: "Bot Token",
        placeholder: "123456:ABC-DEF1234ghIkl...",
        button: "Bağlan",
        connecting: "Bağlanıyor..."
    },
    success: {
        title: "Hazırsınız!",
        description: "{botName} olarak bağlandınız.\nArtık içeriklerinizi hızla paylaşabilirsiniz.",
        buttonEmbedded: "Paneli Aç",
        buttonStandalone: "Kurulumu Kapat"
    },

    // === DASHBOARD ===
    dashboard: {
        greeting: "Merhaba, {name}",
        addChat: "Sohbet Ekle",
        reloadList: "Listeyi Yenile",
        logout: "Çıkış Yap",
        searchPlaceholder: "Hızlı arama...",
        noDestinations: "Henüz hedef eklenmedi",
        noDestinationsHint: "Manuel eklemek için + butonuna tıklayın.",
        sectionPersonal: "Kişisel",
        sectionChannels: "Kanallar & Gruplar",
        sectionOrphans: "Diğer Konular",
        sentTo: "{name} hedefine gönderildi",
        resentTo: "{name} hedefine tekrar gönderildi",
        sendError: "Hata: {error}",
        resendError: "Tekrar Gönderim Hatası: {error}",
        sentSuccess: "Başarıyla Gönderildi",
        failedToSend: "Gönderilemedi",
        resentSuccess: "Tekrar Gönderildi",
        failedToResend: "Tekrar Gönderilemedi",
        unknownError: "Bilinmeyen Hata",
        channelsUpdated: "Kanallar güncellendi",
        recentsUpdated: "Son gönderimler güncellendi",
        logsUpdated: "Kayıtlar güncellendi",
        botWarning: "Bot uyarısı: {error}"
    },

    // === ADD DESTINATION MODAL ===
    addModal: {
        title: "Hedef Ekle",
        labelChatId: "Chat ID veya URL",
        placeholderChatId: "-100... veya web.telegram.org/...",
        labelName: "Görünen Ad",
        placeholderName: "Kanalım",
        validationError: "Zorunlu alanlar eksik!",
        cancel: "İptal",
        add: "Ekle"
    },

    // === CONFIRM MODAL ===
    confirmModal: {
        cancel: "İptal",
        clearRecents: "Son Gönderimler Temizlensin mi?",
        clearLogs: "Kayıtlar Temizlensin mi?",
        clearRecentsMsg: "Bu işlem geri alınamaz. Tüm gönderim geçmişi kalıcı olarak silinecektir.",
        clearLogsMsg: "Bu işlem geri alınamaz. Tüm sistem kayıtları kalıcı olarak silinecektir.",
        clearAll: "Tümünü Temizle"
    },

    // === TABS ===
    tabs: {
        channels: "Kanallar",
        recents: "Son Gönderiler",
        logs: "Kayıtlar"
    },

    // === RECENTS VIEW ===
    recents: {
        noRecents: "Henüz gönderim yok",
        noRecentsHint: "Son gönderimleriniz burada görünecek.",
        history: "Geçmiş",
        clearAll: "Tümünü Temizle",
        recentsCleared: "Gönderim geçmişi temizlendi"
    },

    // === LOGS VIEW ===
    logs: {
        noLogs: "Kayıt bulunamadı",
        noLogsHint: "İşlem geçmişi burada görünecek.",
        systemLogs: "Sistem Kayıtları",
        clearAll: "Tümünü Temizle",
        logsCleared: "Sistem kayıtları temizlendi",
        target: "Hedef:",
        details: "Teknik Detaylar",
        noDetails: "Teknik detay bulunmuyor."
    },

    // === TARGET LIST ITEM (Tooltips) ===
    targetItem: {
        unpin: "Sabitlemeyi Kaldır",
        pinToTop: "Başa Sabitle",
        pin: "Sabitle",
        rename: "Yeniden Adlandır",
        remove: "Kaldır",
        sendCurrent: "Mevcut Sayfayı Gönder",
        send: "Gönder",
        delete: "Sil",
        resend: "Tekrar Gönder"
    },

    // === RECENT ITEM CARD ===
    recentCard: {
        interactiveLocation: "Etkileşimli Konum",
        uncompressedFile: "Sıkıştırılmamış Dosya",
        audioFile: "Ses Dosyası",
        imageUnavailable: "Görsel kullanılamıyor"
    },

    // === RECENT ITEM DETAIL ===
    recentDetail: {
        resend: "Tekrar Gönder",
        openInMaps: "Haritada Aç",
        copyLink: "Linki Kopyala",
        copy: "Kopyala",
        originalQualityDoc: "Orijinal Kalite Belge",
        nativeAudioContent: "Yerel Ses İçeriği"
    },

    // === ERROR BOUNDARY ===
    errorBoundary: {
        title: "Bir şeyler ters gitti",
        message: "Beklenmeyen bir hata oluştu. Lütfen tekrar deneyin veya eklentiyi yeniden yükleyin.",
        tryAgain: "Tekrar Dene",
        reload: "Yenile"
    },

    // === VIEW MODE ===
    viewMode: {
        compact: "Kompakt Görünüm",
        bento: "Bento Görünüm",
        gallery: "Galeri Görünüm"
    },

    // === BACKGROUND (Service Worker) ===
    background: {
        extensionEvent: "Sistem: Eklenti {reason}",
        browserStartup: "Sistem: Tarayıcı başlatılması",
        regionSent: "Bölge Gönderildi!",
        regionFailed: "Bölge Gönderilemedi",
        regionSentTo: "{name} hedefine gönderildi",
        regionCapturedSent: "Bölge yakalandı ve {name} hedefine gönderildi",
        regionCaptureFailed: "Bölge yakalama başarısız: {error}",
        regionCaptureError: "Bölge Yakalama Hatası",
        regionCaptureErrorMsg: "Bölge yakalanamadı.",
        regionCaption: "\u2702\ufe0f Bölge Yakalama\n{title}\n{url}",
        regionPreview: "\u2702\ufe0f Bölge: {title}",
        connectionError: "Bağlantı Hatası",
        connectionErrorMsg: "SwiftShift'i düzgün kullanmak için sayfayı yenileyin.",
        noTargetFound: "Hedef Bulunamadı",
        noTargetFoundMsg: "Lütfen eklenti panelinden varsayılan bir hedef seçin.",
        quickSendTriggered: "Hızlı Gönderim Tetiklendi (Alt+Q)",
        quickSent: "Hızlı Gönderim: {text}...",
        quickSendFailed: "H\u0131zl\u0131 G\u00f6nderim Ba\u015far\u0131s\u0131z: {error}"
    },

    // === CONTEXT MENU ===
    contextMenu: {
        rebuilding: "Ba\u011flam men\u00fcleri yeniden olu\u015fturuluyor (v0.4.0)...",
        allTargets: "\ud83d\udcc2 T\u00fcm Hedefler",
        noTargets: "\u26a0\ufe0f Hedef bulunamad\u0131. Eklemek i\u00e7in eklentiyi a\u00e7\u0131n.",
        addToSwiftShift: "\u2795 SwiftShift'e Ekle",
        setupRequired: "\u26a0\ufe0f Kurulum Gerekli (Eklenti Simgesine T\u0131klay\u0131n)",
        sendTextTo: "\u26a1 {name} hedefine Metin G\u00f6nder",
        sendLinkTo: "\u26a1 {name} hedefine Link G\u00f6nder",
        sendImageTo: "\u26a1 {name} hedefine G\u00f6rsel G\u00f6nder",
        sendPageTo: "\u26a1 {name} hedefine Sayfa G\u00f6nder",
        smartSend: "\ud83d\ude80 Ak\u0131ll\u0131 G\u00f6nderim (Otomatik)",
        sendAsPhoto: "\ud83d\uddbc\ufe0f Foto\u011fraf Olarak G\u00f6nder (S\u0131k\u0131\u015ft\u0131r\u0131lm\u0131\u015f)",
        sendAsFile: "\ud83d\udcc4 Dosya Olarak G\u00f6nder (Orijinal)",
        captureAndSend: "\ud83d\udcf7 Tam Sayfay\u0131 Yakala",
        built: "Ba\u011flam Men\u00fcs\u00fc v0.4.0 olu\u015fturuldu.",
        builtDetails: "{pinned} sabitlenmi\u015f, {total} toplam."
    },

    // === CLICK HANDLER (Notifications & Logs) ===
    clickHandler: {
        sentTo: "{name} hedefine g\u00f6nderildi",
        failedSend: "Ba\u015far\u0131s\u0131z: {error}"
    },

    // === CAPTURE HANDLER ===
    capture: {
        noBot: "Bot ba\u011flant\u0131s\u0131 bulunamad\u0131.",
        regionUnavailable: "Bu sayfada b\u00f6lge se\u00e7imi yap\u0131lam\u0131yor.",
        captureSent: "Yakalama G\u00f6nderildi!",
        captureFailed: "Yakalama Ba\u015far\u0131s\u0131z",
        sentToCompressed: "{name} hedefine g\u00f6nderildi (S\u0131k\u0131\u015ft\u0131r\u0131lm\u0131\u015f)",
        sentToUncompressed: "{name} hedefine g\u00f6nderildi (Orijinal)",
        captureError: "Yakalama Hatas\u0131",
        captureErrorMsg: "Sayfa yakalanamad\u0131. Chrome:// veya k\u0131s\u0131tl\u0131 sayfalarda \u00e7al\u0131\u015fmaz.",
        captureFailedLog: "Sayfa yakalama ba\u015far\u0131s\u0131z"
    },

    // === DESTINATION HANDLER ===
    destination: {
        error: "Hata",
        cannotDetectPage: "Mevcut sayfa alg\u0131lanamad\u0131.",
        setupRequired: "Kurulum Gerekli",
        setupRequiredMsg: "L\u00fctfen \u00f6nce botunuzu ba\u011flay\u0131n.",
        cannotDetectChatId: "URL'den Chat ID alg\u0131lanamad\u0131.",
        alreadyExists: "Zaten Mevcut",
        alreadyExistsMsg: "Bu sohbet zaten hedeflerinizde.",
        addedToSwiftShift: "SwiftShift'e Eklendi!"
    },

    // === TELEGRAM ERRORS ===
    telegramErrors: {
        chatNotFound: "Sohbet bulunamad\u0131. Bot eri\u015fimi olmayabilir.",
        topicNotFound: "Konu bulunamad\u0131. Silinmi\u015f olabilir.",
        badRequest: "Ge\u00e7ersiz istek. L\u00fctfen girdilerinizi kontrol edin.",
        invalidToken: "Ge\u00e7ersiz bot token. L\u00fctfen tekrar yap\u0131land\u0131r\u0131n.",
        blocked: "Bot engellendi veya yetkisi yok.",
        rateLimit: "H\u0131z s\u0131n\u0131r\u0131 a\u015f\u0131ld\u0131. L\u00fctfen bekleyip tekrar deneyin.",
        unknown: "Bilinmeyen bir hata olu\u015ftu."
    }
};
