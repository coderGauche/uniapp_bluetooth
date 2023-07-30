import {
    openBluetoothAdapter, // 初始化蓝牙模块
    closeBluetoothAdapter, // 关闭蓝牙模块
    getBluetoothAdapterState, // 获取本机蓝牙适配器状态
    startBluetoothDevicesDiscovery, // 开始搜寻附近的蓝牙外围设备
    stopBluetoothDevicesDiscovery, // 停止搜寻附近的蓝牙外围设备
    onBluetoothDeviceFound, // 监听寻找到新设备的事件 cb devices
    getBluetoothDevices, // 获取在蓝牙模块生效期间所有已发现的蓝牙设备
    createBLEConnection, // 连接低功耗蓝牙设备 deviceId
    onBLEConnectionStateChange, // 监听低功耗蓝牙连接状态的改变事件。包括开发者主动连接或断开连接，设备丢失，连接异常断开等等
    getBLEDeviceServices, // 获取蓝牙设备所有服务(service) deviceId
    getBLEDeviceCharacteristics, // 获取蓝牙设备某个服务中所有特征值 {deviceId, serviceId}
    notifyBLECharacteristicValueChange, // 启用低功耗蓝牙设备特征值变化时的 notify 功能，订阅特征值 {deviceId, serviceId, characteristicId, state = true}
    onBLECharacteristicValueChange, // 监听低功耗蓝牙设备的特征值变化事件 cb result
    awaitWrapper
} from '@/utils/bluetooth.js'

import { errTips } from '@/utils/uniTools.js'

import { setStorage, getStorage } from '@/utils/storage.js'

// const devicesNameArr = ['Kunhong40-DD11', 'FAYA', 'HC-08', 'OSTRAN']

/**
 * deviceFoundCb(device, bluetoothDevices) 找到蓝牙设备时的回调函数 device 新找到的蓝牙设备, bluetoothDevices 之前搜索到的蓝牙列表（已根据 devicesNameArr 列表过滤）
 * connectionStateChangeCb(Object) 监听的蓝牙连接状态改变的回调函数 { deviceId, connected }
 */
export async function initBluetooth({ deviceFoundCb, connectionStateChangeCb, devicesNameArr = ['Kunhong40-DD11', 'FAYA', 'HC-08', 'OSTRAN', 'MPT-II'] }) {
    const [err_close, res_close] = await awaitWrapper(closeBluetoothAdapter())
    console.log('[err_close, res_close]', [err_close, res_close])
    let bluetoothDevices = [] // 已发现的蓝牙列表
    const [err, res] = await awaitWrapper(openBluetoothAdapter())
    console.log('[err, res]', [err, res])
    const [err0, res0] = await awaitWrapper(getBluetoothAdapterState())
    console.log('[err0, res0]', [err0, res0])
    onBluetoothDeviceFound(async ({ devices }) => {
        const [err, res] = await awaitWrapper(getBluetoothDevices())
        const { devices: devicesGetArr } = res
        bluetoothDevices = devicesGetArr.filter(item => devicesNameArr.indexOf(item.name) > -1)
        if (devicesNameArr.indexOf(devices[0].name) > -1) {
            console.log('devicesGetArr', bluetoothDevices)
            onBLEConnectionStateChange(connectionStateChangeCb)
            deviceFoundCb(devices[0], bluetoothDevices)
        }
        if (devices[0].name) {
            console.log('onBluetoothDeviceFound, devices2', devices)
        }
    })
    const [err1, res1] = await awaitWrapper(startBluetoothDevicesDiscovery())
    console.log('[err1, res1]', [err1, res1])
}

/**
 * deviceId 蓝牙设备 deviceId
 * serviceId 蓝牙设备 serviceId
 * valueChangeCb 监听的蓝牙设备传值时的回调函数 {deviceId: String, serviceId: String, characteristicId: String, value: ArrayBuffer }
 * needStop Boolean 进入时是否需要停止搜索附近蓝牙
 * devicesName 用于存放本地 local 的蓝牙名称
 */
export async function connectBluetooth({ deviceId, devicesArr = [], valueChangeCb, needStop = true, devicesName, property = 'notify', getDevicesArr }) {
    if (needStop) {
        const [err2, res2] = await awaitWrapper(stopBluetoothDevicesDiscovery())
        console.log('[err2, res2]', [err2, res2])
    }

    const [err3, res3] = await awaitWrapper(createBLEConnection(deviceId))
    console.log('[err3, res3]', [err3, res3])
    if (!devicesArr.length) {
        const [err4, res4] = await awaitWrapper(getBLEDeviceServices(deviceId))
        console.log('[err4, res4]', [err4, res4])
        const prList = []
        res4.services.forEach(item => {
            let serviceId = item.uuid
            console.log('item, deviceId', item, deviceId)
            const pr = getBLEDeviceCharacteristics({ deviceId, serviceId }).catch(err => err) // for Promise.all
            prList.push(pr)
        })
        console.log(prList)
        const [err5, res5] = await awaitWrapper(Promise.all(prList)) // error
        console.log('[err5, res5]', [err5, res5])
        res5.forEach((item) => {
            if (!item.errCode) {
                const serviceId = item.serviceId
                item.characteristics.forEach(characteristic => {
                    if (characteristic.properties[property]) {
                        let characteristicId = characteristic.uuid
                        console.log(' deviceId = [' + deviceId + ']  serviceId = [' + serviceId + '] characteristics=[' + characteristicId)
                        devicesArr.push({
                            deviceId,
                            serviceId,
                            characteristicId
                        })
                    }
                })
            }
        })
        if (devicesArr.length) {
            setStorage(devicesName, { deviceId, devicesArr })
        }
        console.log('getStorage(devicesName)', getStorage(devicesName))
    } else {
        // for ios, ios 必须 getBLEDeviceCharacteristics 后才能 notifyBLECharacteristicValueChange
        const [err4, res4] = await awaitWrapper(getBLEDeviceServices(deviceId))
        console.log('[err4, res4]', [err4, res4])
        const prList = []
        devicesArr.forEach(item => {
            const pr = getBLEDeviceCharacteristics({ deviceId: item.deviceId, serviceId: item.serviceId }).catch(err => err) // for Promise.all
            prList.push(pr)
        })
        const [err5, res5] = await awaitWrapper(Promise.all(prList)) // error
        console.log('[err5, res5]', [err5, res5])
    }

    if (property === 'notify') { // 仅 notify 时监听特征值变化
        const prList2 = []
        console.log('devicesArr', devicesArr)
        devicesArr.forEach(item => {
            if (!item.errCode) {
                const pr = notifyBLECharacteristicValueChange(item).catch(err => err) // for Promise.any
                prList2.push(pr)
            }
        })
        // 监听特征值数组中 第一个监听成功的蓝牙 特征值。遍历数组，谁先连接 就监听谁。
        const [err6, res6] = await awaitWrapper(Promise.any(prList2))
        console.log('[err6, res6]', [err6, res6])
        onBLECharacteristicValueChange(res => {
            valueChangeCb(res)
        })
    } else {
        getDevicesArr(devicesArr)
    }
}

/**
 * connectionStateChangeCb(Object) 监听的蓝牙连接状态改变的回调函数 { deviceId, connected }
 * devicesNameArr String|Array 需要自动连接的蓝牙名称 
 * valueChangeCb 监听的蓝牙设备传值时的回调函数 {deviceId: String, serviceId: String, characteristicId: String, value: ArrayBuffer }
 */
export async function autoConnectBluetooth({ connectionStateChangeCb, devicesNameArr, valueChangeCb, property = 'notify', getDevicesArr }) {
    const [err_close, res_close] = await awaitWrapper(closeBluetoothAdapter())
    console.log('[err_close, res_close]', [err_close, res_close])
    let bluetoothDevices = [] // 已发现的蓝牙列表
    const [err, res] = await awaitWrapper(openBluetoothAdapter())
    console.log('[err, res]', [err, res])
    const [err0, res0] = await awaitWrapper(getBluetoothAdapterState())
    console.log('[err0, res0]', [err0, res0])
    if (devicesNameArr) {
        // 如果传入的是字符串，将其转为数组
        if (!Array.isArray(devicesNameArr)) {
            devicesNameArr = [devicesNameArr]
        }
        const localDevice = getStorage(devicesNameArr[0])
        console.log('localDevice', localDevice)
        if (localDevice) {
            onBLEConnectionStateChange(connectionStateChangeCb)
            connectBluetooth({
                deviceId: localDevice.deviceId,
                devicesArr: localDevice.devicesArr,
                needStop: false,
                valueChangeCb,
                devicesName: devicesNameArr[0],
                property,
                getDevicesArr
            })
        } else {
            let isConnected = false
            onBluetoothDeviceFound(async ({ devices }) => {
                const [err, res] = await awaitWrapper(getBluetoothDevices())
                const { devices: devicesGetArr } = res
                bluetoothDevices = devicesGetArr.filter(item => devicesNameArr.indexOf(item.name) > -1)
                if (devicesNameArr.indexOf(devices[0].name) > -1 && !isConnected) {
                    isConnected = true
                    console.log('devicesGetArr', bluetoothDevices)
                    onBLEConnectionStateChange(connectionStateChangeCb)
                    connectBluetooth({
                        deviceId: devices[0].deviceId,
                        valueChangeCb,
                        devicesName: devicesNameArr[0],
                        property,
                        getDevicesArr
                    })
                }
                if (devices[0].name) {
                    console.log('onBluetoothDeviceFound, devices2', devices)
                }
            })
            const [err1, res1] = await awaitWrapper(startBluetoothDevicesDiscovery())
            console.log('[err1, res1]', [err1, res1])
        }
    } else {
        errTips('请传入 devicesNameArr 参数用于自动连接')
    }
}