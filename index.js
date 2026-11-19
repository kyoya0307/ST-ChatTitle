/* Settings belong to the extension, so changing UI themes does not reset them. */
const KEY = 'st_chat_title';

function getSettings() {
    const context = SillyTavern.getContext();
    let settings = context.extensionSettings[KEY];
    if (!settings || typeof settings !== 'object' || Array.isArray(settings)) {
        settings = context.extensionSettings[KEY] = {};
    }
    if (typeof settings.enabled !== 'boolean') settings.enabled = true;
    if (typeof settings.wrap !== 'boolean') settings.wrap = true;
    return settings;
}

function applySettings() {
    const settings = getSettings();
    document.body.classList.toggle('stct-enabled', settings.enabled);
    document.body.classList.toggle('stct-wrap', settings.enabled && settings.wrap);
    document.querySelectorAll('#stct-settings input[data-setting]').forEach(input => {
        input.checked = settings[input.dataset.setting];
    });
}

function mountSettings() {
    if (document.getElementById('stct-settings')) return;
    const host = document.getElementById('extensions_settings2') || document.getElementById('extensions_settings');
    if (!host) return;
    const panel = document.createElement('div');
    panel.id = 'stct-settings';
    panel.className = 'inline-drawer';
    panel.innerHTML = `
        <div class="inline-drawer-toggle inline-drawer-header">
            <b>对话标题</b>
            <div class="inline-drawer-icon fa-solid fa-circle-chevron-down down"></div>
        </div>
        <div class="inline-drawer-content">
            <label class="checkbox_label">
                <input type="checkbox" data-setting="enabled">
                <span>隐藏最近聊天标题前的角色名</span>
            </label>
            <label class="checkbox_label">
                <input type="checkbox" data-setting="wrap">
                <span>手机阅读优化：长标题换行，按钮另起一行</span>
            </label>
            <p>在最近聊天列表点击原有铅笔按钮修改对话名。切换主题后继续生效。</p>
        </div>`;
    panel.querySelectorAll('input[data-setting]').forEach(input => {
        input.addEventListener('change', () => {
            getSettings()[input.dataset.setting] = input.checked;
            applySettings();
            SillyTavern.getContext().saveSettingsDebounced();
        });
    });
    host.append(panel);
}

function init() {
    mountSettings();
    applySettings();
    const context = SillyTavern.getContext();
    const events = context.eventTypes || context.event_types;
    if (events?.APP_READY) {
        context.eventSource.on(events.APP_READY, () => {
            mountSettings();
            applySettings();
        });
    }
    if (events?.SETTINGS_LOADED_AFTER) {
        context.eventSource.on(events.SETTINGS_LOADED_AFTER, applySettings);
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
} else {
    init();
}
