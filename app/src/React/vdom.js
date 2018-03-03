/* @flow */
import {typeNumber} from "./utils";
const DATA_ATTR_REACT_ID: string = 'data-reactid';

/**
 * 空的节点返回空
 * react 官方会对空节点返回一段注释
 */
class ReactDOMEmptyComponent {
    constructor() {
        this.Vnode = null;
    }
    mountComponent(rootID) {
        return "";
    }
}

/**
 * 文本节点,直接渲染文字
 * @param {string} text
 */
class ReactDOMTextComponent {
    constructor(text: string) {
        this.Vnode = text;
        this._stringText = text;
    }

    mountComponent(rootID) {
        return this._stringText;
    }
}

/**
 * 原生节点,div,span,etc...
 * @param {Vnode} Vnode
 */

class ReactDOMComponent {
    constructor(Vnode) {
        let HTMLTag: string = Vnode.type;
        this.Vnode = Vnode;
        this._tag = HTMLTag.toLowerCase();
    }
    mountComponent(rootID) {

        let result: string = `<${this._tag} ${DATA_ATTR_REACT_ID}=${rootID}`;
        let props = this.Vnode.props;

        for(let propsName in props) {
            //去掉名字为children的属性,因为html标签其实是不含有children标签
            if(propsName === 'children') continue;
            let propsValue = props[propsName];
            /*获取style*/
            if (propsName === 'style') {
                propsValue = '';
                Object.keys(props[propsName]).forEach( key => {
                    propsValue += `${key}:${props[propsName][key]};`;
                })
            }

            result += ` ${propsName}="${propsValue}"`;
        }
        result += '>'

        /*递归渲染子节点*/
        let childrenResult = '';
        if (props.children) {
            childrenResult = this.mountChildren(props.children, rootID);
        }
        result += childrenResult;
        result += `</${this._tag}`;
        return result;
    }

    mountChildren(child, rootID) {
        let result = '';
        /*判断子节点的类型*/
        let childType = typeNumber(child);
        if(childType === 7 ){
            for( let i in child) {
                const childrenComponent = instantiateReactComponent(child[i]);
                result += childrenComponent.mountComponent(rootID++);
            }
        }else {
            const childrenComponent = instantiateReactComponent(child);
            result += childrenComponent.mountComponent(rootID++);

        }
        return result;
    }

}

class ReactCompositeComponent {
    constructor(element) {
        this._element = element;
    }

    mountComponent(rootID) {
        /*此时的type是一个function或者class(ReactClass)*/
        const Component = this._element.type;
        const props = this._element.props;
        const instance = new Component(props);
        /*当我们调用这个class的render()函数的时候,babel就会帮我们把这个函数之中的jsx转换成Vnode*/
        const renderElement = instance.render();
        const renderComponent = instantiateReactComponent(renderElement);
        const renderResult = renderComponent.mountComponent(rootID);
        return renderResult;

    }
}

/**
 * 生成一个组件的实例, 是一个react节点, mountComponent()方法被定义为返回其HTML字符串
 * @param {ReactElement|string|number|false|null} Vnode
 */
export function instantiateReactComponent(Vnode) {
    /*定义一个实例*/
    let instance = null;
    /*空节点,直接制造一个空的react component*/
    if(Vnode === null || Vnode === false) {
        instance = new ReactDOMEmptyComponent();
    }
    /*文字节点,得到一个文字字符串*/
    if(typeof Vnode === 'string' || typeof Vnode === 'number') {
        instance = new ReactDOMTextComponent(Vnode);
    }

    /**
     * 是否是一个原生节点或者自定义节点
     * 原生: div,span,h,p
     * 自定义: <View/> <Butt/>
     */
    if(typeof Vnode === 'object') {
        let type = Vnode.type;
        //原生节点的type是string
        if(typeof type === 'string') {
            instance = new ReactDOMComponent(Vnode);
            //自定义节点是一个函数
        }else if(typeof type === 'function') {
            instance = new ReactCompositeComponent(Vnode);
        }
    }

    return instance;
}

export function render(element, container){
    const mainComponent = instantiateReactComponent(element);
    let rootID = 0;
    const containerConent = mainComponent.mountComponent(0);
    container.innerHTML = containerConent;
}