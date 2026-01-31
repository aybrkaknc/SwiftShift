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
        - **Item 1-3:** Last Used Targets.
        - **Submenu:** "More..." (Full Hierarchy).

## 3. Visual Language (UI System)
## 3. Visual Language (UI System)
- **Style:** Luxury/Premium (Deep Navy Background, Gold Accents).
- **Colors:**
    - **Background:** Deep Navy (`#0a192f` / `#112240`).
    - **Primary:** Gold / Amber (`#ffd700` / `#f59e0b`).
    - **Text:** White / Light Grey.
- **Icons:** Lucide / Heroicons (Outline style).
- **Animations:**
    - **Toast:** Spring physics (iOS style slide-in/out).
    - **Loaders:** Shimmering Skeleton bars (No spinning circles).
    - **Inputs:** Micro-interactions (Focus rings, validation colors).

## 4. Operational Scenarios

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
2. Right Click Video -> SwiftShift -> Target.
3. **Payload:**
    - Text: "Video Source"
    - Link: `https://youtube.com/watch?v=xyz&t=135s` (Auto-calculated).

## 5. Keyboard Shortcut (`Alt+Q`)
**Logic:** Smart Selection.
1. **Trigger:** `Alt+Q`.
2. **Target:** Sends to the **#1 Most Recently Used** target automatically.
