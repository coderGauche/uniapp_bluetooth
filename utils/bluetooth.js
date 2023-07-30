import { errTips } from '@/utils/uniTools.js'

const errText = {
    10000: '未初始化蓝牙适配器',
    10001: '当前蓝牙适配器不可用，请打开蓝牙后重试',
    10002: '没有找到指定设备',
    10003: '连接失败，请检查蓝牙设备是否打开',
    10004: '没有找到指定服务',
    10005: '没有找到指定特征值',
    10006: '当前连接已断开',
    10007: '当前特征值不支持此操作',
    10008: '其余所有系统上报的异常',
    10009: '系统特有，系统版本低于 4.3 不支持 BLE'
}

export function awaitWrapper(promise) {
    return promise
        .then(res => [null, res])
        .catch(err => {
            if (err.errCode) {
                errTips(errText[err.errCode], 2000)
            }
            console.log(err)
            throw new Error(err.errMsg)
            // return [err, null]
        })
}

/**
 * 初始化蓝牙模块
 */
export async function openBluetoothAdapter() {
    return new Promise((resolve, reject) => {
        uni.openBluetoothAdapter({
            success(e) {
                resolve(e)
            },
            fail(e) {
                reject(e)
            }
        })
    })
}

/**
 * 关闭蓝牙模块，调用该方法将断开所有已建立的连接并释放系统资源
 */
export async function closeBluetoothAdapter() {
    return new Promise((resolve, reject) => {
        uni.closeBluetoothAdapter({
            success(e) {
                resolve(e)
            },
            fail(e) {
                reject(e)
            }
        })
    })
}

/**
 * 获取本机蓝牙适配器状态，查看蓝牙是否打开或损坏等蓝牙状态
 */
export async function getBluetoothAdapterState() {
    return new Promise((resolve, reject) => {
        uni.getBluetoothAdapterState({
            success(e) {
                resolve(e)
            },
            fail(e) {
                reject(e)
            }
        })
    })
}

/**
 * 开始搜寻附近的蓝牙外围设备
 */
export async function startBluetoothDevicesDiscovery() {
    return new Promise((resolve, reject) => {
        uni.startBluetoothDevicesDiscovery({
            success(res) {
                resolve(res)
            },
            fail(err) {
                reject(err)
            }
        });
    })
}

/**
 * 停止搜寻附近的蓝牙外围设备
 */
export async function stopBluetoothDevicesDiscovery() {
    return new Promise((resolve, reject) => {
        uni.stopBluetoothDevicesDiscovery({
            success(res) {
                resolve(res)
            },
            fail(err) {
                reject(err)
            }
        });
    })
}

/**
 * 监听寻找到新设备的事件
 */
export async function onBluetoothDeviceFound(cb) {
    uni.onBluetoothDeviceFound(devices => {
        cb(devices)
    })
}

/**
 * 获取在蓝牙模块生效期间所有已发现的蓝牙设备
 */
export async function getBluetoothDevices() {
    return new Promise((resolve, reject) => {
        uni.getBluetoothDevices({
            success(res) {
                resolve(res)
            },
            fail(err) {
                reject(err)
            }
        })
    })
}

/**
 * 连接低功耗蓝牙设备
 */
export async function createBLEConnection(deviceId) {
    return new Promise((resolve, reject) => {
        uni.createBLEConnection({
            deviceId,
            success(res) {
                resolve(res)
            },
            fail(err) {
                reject(err)
            }
        })
    })
}

/**
 * 断开低功耗蓝牙设备
 */
export async function closeBLEConnection(deviceId) {
    return new Promise((resolve, reject) => {
        uni.closeBLEConnection({
            deviceId,
            success(res) {
                resolve(res)
            },
            fail(err) {
                reject(err)
            }
        })
    })
}

/**
 * 监听低功耗蓝牙连接状态的改变事件。包括开发者主动连接或断开连接，设备丢失，连接异常断开等等
 */
export async function onBLEConnectionStateChange(cb) {
    return new Promise((resolve, reject) => {
        uni.onBLEConnectionStateChange(({ deviceId, connected }) => {
            cb({ deviceId, connected })
        })
    })
}

/**
 * 获取蓝牙设备所有服务(service)
 */
export async function getBLEDeviceServices(deviceId) {
    return new Promise((resolve, reject) => {
        uni.getBLEDeviceServices({
            deviceId,
            success(res) {
                resolve(res)
            },
            fail(err) {
                reject(err)
            }
        })
    })
}

/**
 * 获取蓝牙设备某个服务中所有特征值(characteristic) characteristics Array<Object> {uuid: characteristicId}
 */
export async function getBLEDeviceCharacteristics({ deviceId, serviceId }) {
    return new Promise((resolve, reject) => {
        uni.getBLEDeviceCharacteristics({
            deviceId,
            serviceId,
            success(res) {
                res.serviceId = serviceId
                resolve(res)
            },
            fail(err) {
                reject(err)
            }
        })
    })
}

/**
 * 启用低功耗蓝牙设备特征值变化时的 notify 功能，订阅特征值
 */
export async function notifyBLECharacteristicValueChange({ deviceId, serviceId, characteristicId, state = true }) {
    return new Promise((resolve, reject) => {
        uni.notifyBLECharacteristicValueChange({
            deviceId,
            serviceId,
            characteristicId,
            state,
            success(res) {
                resolve(res)
            },
            fail(err) {
                reject(err)
            }
        })
    })
}

/**
 * 监听低功耗蓝牙设备的特征值变化事件
 */
export async function onBLECharacteristicValueChange(cb) {
    uni.onBLECharacteristicValueChange(res => {
        cb(res)
    })
}

/**
 * 向低功耗蓝牙设备特征值中写入二进制数据。
 * value {ArrayBuffer}
 */
export async function writeBLECharacteristicValue({ deviceId, serviceId, characteristicId, value }) {
    return new Promise((resolve, reject) => {
        uni.writeBLECharacteristicValue({
            deviceId,
            serviceId,
            characteristicId,
            value,
            success(res) {
                resolve(res)
            },
            fail(err) {
                reject(err)
            }
        })
    })
}
