//@flow
import {createElement} from './createElement';
import  {render} from './vdom';
import  {ReactClass} from './component';

const React = {
    createElement, /*babel 的默认设置调用的是createElement这个函数*/
    render,
    Component: ReactClass
}

export default React