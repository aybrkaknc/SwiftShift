# SwiftShift User Experience (UX) Flow

## 1. Onboarding (First Run)
**Objective:** Get the Bridge running in under 60 seconds with Delight.

1. **User installs extension.**
2. **Browser Action:** User clicks the SwiftShift icon in toolbar.
3. **Popup Opens:**
    - **Theme:** Auto-detects System Theme (Default: Dark).
    - **Header:** "SwiftShift Setup"
    - **Input Field:** "Bot Token" 
        - **State:** Masked (`123...abc`).
        - **Interaction:** Border turns Green on valid format (regex check), Red on invalid.
    - **Button:** "Connect" (Shows Skeleton Loader while validating).
4. **Chat ID Setup:**
    - **Guide:** "Add bot to your channel/group."
    - **Button:** "Detect Chat ID" (Skeleton Loader during fetch).
    - **Result:** Found chats listed. User selects one.
5. **Finalize:** Profile saved.

## 2. Context Menu (Smart Topology)
**Logic:** Adaptive Hierarchy & Error Aware.

- **Status Check:** Before building menu.
    - **If Config Missing:**
        - Root: "SwiftShift"
        - Submenu: "⚠️ Token Needed" (Click opens Settings).
    - **If Config OK:**
        - Root: "SwiftShift" (Icon).
        - **Dynamic Submenus:**
            - **Text/Link:** Simple target list.
            - **Image/Capture:** "Send Compressed (Photo)" vs "Send Uncompressed (File)" options.
            - **Capture Only:** "Select Region..." interactive tool.
        - **Item 1-3:** Last Used Targets (Smart Sorted).
        - **Submenu:** "More..." (Full Hierarchy).

## 3. Visual Language (UI System)
- **Style:** Luxury/Premium (Deep Navy Background, Gold Accents).
- **Colors:**
    - **Background:** Deep Navy (`#0b1121`).
    - **Surface:** Navy Blue (`#15203b`).
    - **Primary:** Gold / Amber (`#f4ab25`).
- **Layout Patterns:**
    - **Integrated Edge Action Bar:** Actions are embedded into the right edge of list items, appearing on hover with a theme-aware gradient fade (Navy/Dark, White/Light).
    - **Vertical Hierarchy Lines:** Sections use vertical gradient lines descending from chevrons to create a "Tree View" effect, improving structural clarity.
- **Icons:** Lucide-React (Customized sizes for visibility, 16px-18px for main actions).
- **Animations:**
    - **Toast:** Bottom-aligned, spring-physics slide-in from bottom to top.
    - **Loaders:** Shimmering Skeleton bars & conditional spin animations for manual refresh.
    - **Hover Effects:** Scale transitions and border-glows on interactive recents.

## 4. Recents Interactivity
- **Smart Links:** All links in the recents history are directly clickable and open in a new tab.
- **Image Previews:** Images and file-based visuals expand/open in original quality when clicked.
- **Event Management:** Click events on specific content are isolated (stopPropagation) to prevent unintentional modal expansion.

## 5. Operational Scenarios

### Scenario A: Sending Text/Link
(Standard Flow)
1. Select Text/Link -> Right Click -> SwiftShift -> Target.
2. Background: Sends payload.
3. UX: Silent success.

### Scenario B: Sending Large Image (The Fallback)
1. User sends 15MB Image.
2. **Background:** Downloads Blob -> Tries `sendPhoto`.
3. **Telegram API:** Returns `413 Request Entity Too Large`.
4. **UX:** Toast/Modal appears on page (Spring Animation):
    > "Image is too large for direct upload. Send as link instead?"
    > [Yes, Send Link] | [Cancel]
5. **User Clicks Yes:** Extension sends the Image URL.

### Scenario C: Video with Timestamp
1. User pauses YouTube video at `02:15`.
2. Right Click -> SwiftShift -> Target.
3. **Payload:** Link with `&t=135s` (calculated).

### Scenario D: Region Capture (New in v0.2.0)
1. Right Click -> Capture Page -> Select Region.
2. **UX:** Page dims, custom crosshair appears.
3. **Interaction:** User drags to draw a dashed rectangle.
4. **Action:** On release, rectangle is cropped and sent instantly.

### Scenario E: Location Detection (New in v0.2.0)
1. User right-clicks a Google Maps link or on the map.
2. **Logic:** Content Script parses `@lat,lon` from URL.
3. **Payload:** Sent as a native Telegram **Interactive Location**.

## 5. Keyboard Shortcut (`Alt+Q`)
**Logic:** Smart Selection.
1. **Trigger:** `Alt+Q`.
2. **Current Page:** Detects active URL/Title.
3. **Selection:** If text is selected, sends text instead.
4. **Target:** Sends to the **#1 Most Recently Used** target automatically.
