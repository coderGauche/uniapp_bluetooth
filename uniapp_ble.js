// 初始化蓝牙模块。
function openBluetoothAdapter() {
	return new Promise((reslove, reject) => {
		wx.openBluetoothAdapter({
			success: (res) => {
				console.log(res)
				reslove(res)
			},
			fail: (res => {
				reject(res)
			})
		})
	})
}

// 连接低功耗蓝牙设备
function createBLEConnection() {
	return new Promise((reslove, reject) => {
		wx.createBLEConnection({
			deviceId: uni.getStorageSync('currDev').deviceId,
			success: (res) => {
				console.log('连接蓝牙中')
				console.log(res)
				uni.showLoading({
					title: '连接蓝牙中',
				})
				setTimeout(function() {
					reslove(res)
				}, 2000)
			},
			fail: (res => {
				reject(res)
			})
		})
	})
}

// 初始化蓝牙模块。
function openBluetoothAdapter_f() {
	console.log('我走了openBluetoothAdapter_f方法')
	return new Promise((reslove, reject) => {
		console.log('进Promise')
		wx.openBluetoothAdapter({
			success(res) {
				console.log(res)
				reslove(res)
			},
			fail(err) {
				reject(err)
			}
		})
	})
}

// 获取本机蓝牙适配器状态。
function getBluetoothAdapterState() {
	return new Promise((reslove, reject) => {
		wx.getBluetoothAdapterState({
			success: (res) => {
				reslove(res)
			},
			fail: (res => {
				reject(res)
			})
		})
	})
}

// 始搜寻附近的蓝牙外围设备。
function startBluetoothDevicesDiscovery() {
	return new Promise((reslove, reject) => {
		wx.startBluetoothDevicesDiscovery({
			success: (res) => {
				console.log('进入startBluetoothDevicesDiscovery')
				console.log(res)
				reslove(res)
			},
			fail: (res => {
				reject(res)
			})
		})
	})
}

// 监听寻找到新设备的事件
function onBluetoothDeviceFound() {
	return new Promise((reslove, reject) => {
		wx.onBluetoothDeviceFound(function(devices) {
			var re = JSON.parse(JSON.stringify(devices))
			// console.log(re.devices[0].name)
			let flag = true //节流阀
			if (flag && (re.devices[0].name === 'Kunhong40-DD11' || re.devices[0].name === 'FAYA' || re.devices[0].name === 'HC-08')) { //目测只有三个设备可更改
				flag = false
				reslove(re.devices)
			}
		})
	})
}

// 连接低功耗蓝牙设备
function createBLEConnection_p(deviceId) {
	return new Promise((reslove, reject) => {
		wx.createBLEConnection({
			deviceId: deviceId,
			success: (res) => {
				console.log('连接蓝牙中')
				console.log(res)
				uni.showLoading({
					title: '连接蓝牙中',
				})
				setTimeout(function() {
					reslove(res)
				}, 2000)
			},
			fail: (res => {
				reject(res)
			})
		})
	})
}

// 获取蓝牙设备所有服务(service)。
function getBLEDeviceServices() {
	let deviceId = uni.getStorageSync('currDev').deviceId
	console.log("获取蓝牙设备所有服务(service)。---------------")
	return new Promise((reslove, reject) => {
		wx.getBLEDeviceServices({
			deviceId: deviceId,
			success: (res) => {
				reslove(res)
			},
			fail: (res => {
				reject(res)
			})
		})
	})
}
// 获取蓝牙设备所有服务(service)。
function getBLEDeviceServices_p(deviceId) {
	console.log("获取蓝牙设备所有服务(service)。---------------")
	return new Promise((reslove, reject) => {
		wx.getBLEDeviceServices({
			deviceId: deviceId,
			success: (res) => {
				reslove(res)
			},
			fail: (res => {
				reject(res)
			})
		})
	})
}

// 获取蓝牙设备某个服务中所有特征值(characteristic)。
function getBLEDeviceCharacteristics(deviceId, serviceId) {
	return new Promise((reslove, reject) => {
		wx.getBLEDeviceCharacteristics({
			// 这里的 deviceId 需要已经通过 createBLEConnection 与对应设备建立链接
			deviceId: deviceId,
			// 这里的 serviceId 需要在 getBLEDeviceServices 接口中获取
			serviceId: serviceId,
			success: (res) => {
				setTimeout(() => {
					wx.hideLoading()
				}, 2000)
				uni.showToast({
					title: '连接成功',
					icon: 'none'
				})
				let connect_status = {
					connect_status: 1,
					device_name: uni.getStorageSync('currDev').name
				}
				reslove(connect_status)
			},
			fail: (res => {
				reject(res)
			})
		})
	})
}

//停止搜寻附近的蓝牙外围设备。若已经找到需要的蓝牙设备并不需要继续搜索时，建议调用该接口停止蓝牙搜索。
function stopBluetoothDevicesDiscovery() {
	return new Promise((reslove, reject) => {
		wx.stopBluetoothDevicesDiscovery({
			success: (res) => {
				reslove(res)
			},
			fail: (res => {
				reject(res)
			})
		})
	})
}

//开始执行
async function open_ble() {
	try {
		let deviceId = uni.getStorageSync('currDev').deviceId //获取deviceId
		// 判断有没有deviceId，是否第一次登入情况分别进行操作
		if (deviceId) { //有deviceId情况走下
			let deviceId = uni.getStorageSync('currDev').deviceId //获取deviceId
			let serviceId = '0000FFE0-0000-1000-8000-00805F9B34FB'
			await openBluetoothAdapter() //打开适配器
			await createBLEConnection() //创建链接
			await getBLEDeviceServices() //获取蓝牙特征实例
			let getBLEDevice = await getBLEDeviceCharacteristics(deviceId, serviceId) //实现连接成功
			return getBLEDevice //返回我需要的参数
		} else { //没有deviceId情况走下
			await openBluetoothAdapter_f() //打开适配器
			await startBluetoothDevicesDiscovery() //开始搜寻附近蓝牙设备  
			let onBluetooth = await onBluetoothDeviceFound() //监听新的设备
			console.log(onBluetooth)
			if (onBluetooth.length > 0) { //判断设备devices存不存在
				uni.setStorageSync('currDev', onBluetooth[0])  //存储获取到的蓝牙信息
				let deviceIds = onBluetooth[0].deviceId      //deviceIds
				let serviceId = '0000FFE0-0000-1000-8000-00805F9B34FB'   //serviceId
				await createBLEConnection_p(deviceIds) //创建链接
				await getBLEDeviceServices_p(deviceIds) //获取蓝牙特征实例
				let getBLEDevice = await getBLEDeviceCharacteristics(deviceIds, serviceId) //实现连接成功
				return getBLEDevice //返回我需要的参数 
			}else{  //如果不存在代表没获取到重新去搜索蓝牙并连接
				await stopBluetoothDevicesDiscovery()
				wx.showToast({
					title: '请重新打开蓝牙',
					icon: 'none'
				})
			}
		}
	} catch (error) {
		await stopBluetoothDevicesDiscovery()
		wx.showToast({
			title: '请重新打开蓝牙',
			icon: 'none'
		})
	}
}


export default open_ble
