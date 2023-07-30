/*
 * @Author: Gauche楽
 * @Date: 2023-07-31 03:00:55
 * @LastEditors: Gauche楽
 * @LastEditTime: 2023-07-31 03:01:03
 * @FilePath: /uniapp_bluetooth/libs/utils.js
 */
import { isNumber } from './checkType.js'

const hyphenateRE = /\B([A-Z])/g

/**
 * @description: 驼峰转连字符 - 
 * @param {String} str 要转换的字符串
 * @return {String} 转换后的字符串
 */
export function hyphenate(str) {
    return str.replace(hyphenateRE, '-$1').toLowerCase()
}

/**
 * @description: 将对象拆成键值对连接成字符串并组成数组，键名将会把驼峰转换
 * @param {Object} obj 要转换的对象
 * @param {String} entriesJoinText 对象键值对之间的连字符
 * @param {String} arrayJoinText 对象各属性之间的连字符
 * @return {Array} 转换后的数组
 */
export function objEntriesToArray(obj, entriesJoinText = ':', arrayJoinText = ';') {
    // polyfill 微信小程序不支持 Object.entries
    let entriesFn
    if (!Object.entries) {
        entriesFn = function (obj) {
            var ownProps = Object.keys(obj),
                i = ownProps.length,
                resArray = new Array(i) // preallocate the Array
            while (i--)
                resArray[i] = [ownProps[i], obj[ownProps[i]]]
            return resArray
        }
    } else {
        entriesFn = Object.entries
    }

    const entriesArr = entriesFn(obj)
    const tempArr = entriesArr.map(item => `${hyphenate(item[0])}${entriesJoinText}${item[1]}`)
    return tempArr.join(arrayJoinText)
}

/**
 * @description: 添加单位
 * @param {String} val 要添加单位的值
 * @param {String} unit 要添加的单位名
 * @return {String} 添加单位后的字符串
 */
export function addUnitToNumberVal(val, unit = 'rpx') {
    if (isNumber(val)) {
        return val + '' + unit
    } else if (isNumber(Number(val)) && val !== '') {
        return val + '' + unit
    } else {
        return val
    }
}

/**
 * @description: 数字相加
 * @param {Number} num1
 * @param {Number} num2
 * @return {Number} 相加后的结果
 */
export function accurateAdd(num1, num2) {
    const tmp = 1000
    return (num1 * tmp + num2 * tmp) / tmp
}

/**
 * @description: 数字相减
 * @param {Number} minuend 被减数
 * @param {Number} subtraction 减数
 * @return {Number} 相减后的结果
 */
export function accurateMinus(minuend, subtraction) {
    const tmp = 1000
    return (minuend * tmp - subtraction * tmp) / tmp
}


export function* waterfall(promiseList) {
    console.log('promiseList[0]')
    console.log(promiseList[0])
    let p1 = yield promiseList[0]();
    console.log(p1)
    // let p2 = yield promiseList[1]();
    // let p3 = yield promiseList[2]();
    return [p1]
}
