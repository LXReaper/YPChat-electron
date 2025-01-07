export class myButtonMenu {
    /*interface IBaseMenu {
        readonly title: string;
        readonly iconSvg?: string;
        readonly hotkey?: string;
        readonly alwaysEnable?: boolean;
        readonly tag: string;
        readonly width?: number;
        getValue: (editor: IDomEditor) => string | boolean;
        isActive: (editor: IDomEditor) => boolean;
        isDisabled: (editor: IDomEditor) => boolean;
        exec: (editor: IDomEditor, value: string | boolean) => void;
    }*/

    // 该按钮是否被激活了
    #isActive;

    // 按钮当前状态
    #status;

    constructor(vueInstance) {
        this.vueInstance = vueInstance;
        this.title = '添加标注'; // 自定义菜单标题
        // this.iconSvg = '<svg>...</svg>'; // 可选 菜单图标
        this.tag = 'button'; // 自定义菜单的 HTML 标签
        this.#isActive = false;// 默认设置还未激活
    }

    /**
     * 默认的触发事件
     * @param editor
     */
    defaultExec = (editor) => {}

    /**
     * 设置菜单标题
     * @param title
     */
    setTitle(title) {
        this.title = title;
    }

    /**
     * 设置菜单的图标
     * @param svg
     */
    setIcon(svg) {
        this.iconSvg = svg;
    }

    /**
     * 设置菜单点击事件
     * @param func_ 事件函数
     */
    setExec(func_) {
        this.defaultExec = func_;
    }

    /**
     * 设置当前按钮的激活状态是否激活
     * @param isActive
     */
    setIsActive(isActive) {
        this.#isActive = isActive;
    }

    /**
     * 按钮的状态
     * 可以自定义
     * @param status
     */
    setStatus(status) {
        this.#status = status;
    }

    // 获取菜单执行时的 value，返回空字符串或 false
    getValue(editor) {
        return ''; // 默认返回空
    }

    // 获取当前按钮的状态
    getStatus() {
        return this.#status;
    }

    // 菜单是否需要激活（如选中加粗文本，“加粗”菜单会激活），用不到则返回 false
    isActive(editor) {
        return this.#isActive; // 默认不激活
    }

    // 菜单是否需要禁用（如选中 H1，“引用”菜单被禁用），用不到则返回 false
    isDisabled(editor) {
        return false; // 默认不禁用
    }

    // 点击菜单时触发的函数
    exec(editor, value) {
        if (this.isDisabled(editor)) return;

        this.defaultExec(editor);//调用默认的触发事件
        // 获取选中的文本
        // const selectedText = editor.getSelectionText();
        // 将选中的文本设置到 Vue 实例的数据属性中
        // this.vueInstance.selectedText = selectedText;
        // 显示弹出层 这块可以调用自己的弹出层
        // this.vueInstance.dialogVisible = true;
        // console.log('点击了添加标注按钮',this.vueInstance.selectedText)
    }
}
