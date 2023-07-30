<template>
  <view class="village_mode">
    <template v-if="!isbluetoothConnected">
      <view class="flexCenterWrap" @click="modalShow">
        <Icon
          name="iconSharingwuxianlanyagongxiang6"
          color="#E8E8E8"
          size="36rpx"
        />
        <text class="s24 ml16">未连接</text>
      </view>
    </template>
    <template v-else>
      <view class="flexCenterWrap" @click="modalShow">
        <Icon
          name="iconSharingwuxianlanyagongxiang6"
          color="#007AFF"
          size="36rpx"
        />
        <text class="s24 ml16">已连接</text>
      </view>
    </template>
    <Modal
      title="蓝牙列表"
      :visible="visible"
      @confirm="confirmClicked"
      @cancel="cancelClicked"
    >
      <view
        class="mb16 flex-between listWrap"
        v-for="device in bluetoothDevices"
        :key="device.deviceId"
        @click="deviceSelected(device)"
      >
        <view class="text-left">
          <view class="s32 cFThick mb20"
            >{{ device.name
            }}{{
              connectedDeviceId === device.deviceId ? "（已连接）" : ""
            }}</view
          >
          <view class="s28 cFNormal mb16">信号强度：{{ device.RSSI }}</view>
          <view class="s28 cFNormal">设备ID：{{ device.deviceId }}</view>
        </view>
        <view v-if="currentDeviceId === device.deviceId" class="flexCenterWrap">
          <Icon name="iconwancheng" size="60rpx" color="#4CC72A" />
        </view>
      </view>
    </Modal>
  </view>
</template>

<script>
import Modal from "@/extra/components/Modal/index.vue";
import Icon from "@/extra/components/Icon/index.vue";

import {
  initBluetooth,
  connectBluetooth,
  autoConnectBluetooth,
} from "./bluetooth.js";

import {
  closeBluetoothAdapter,
  closeBLEConnection,
  awaitWrapper,
  startBluetoothDevicesDiscovery,
  writeBLECharacteristicValue,
} from "@/utils/bluetooth.js";

// import decode from './js/GbkTextEncoder.js'
// import { decodeMsg, weightFormat, rfidFormat } from '@/village_mode/static/js/decode.js'

export default {
  name: "Bluetooth",
  components: {
    Modal,
    Icon,
  },
  props: {
    autoConnectDeviceName: {
      type: String,
      default: "",
    },
  },
  data() {
    return {
      visible: false,
      bluetoothDevices: [],
      isbluetoothConnected: false,
      currentDeviceId: "",
      connectedDeviceId: "",
      isInit: false,
      iosDone: false,
      property: "notify",
      writeDevice: {},
      timer: 0,
    };
  },
  mounted() {
    if (this.autoConnectDeviceName === "MPT-II") {
      this.property = "write";
    }
    if (this.autoConnectDeviceName) {
      this.autoConnectBluetooth();
      // ios 第一次进入 监听蓝牙事件调用极慢，重新初始化后即可
      // if (uni.getSystemInfoSync().platform == 'ios' && !this.iosDone) {
      // 	setTimeout(() => {
      // 		this.autoConnectBluetooth()
      // 	}, 2000)
      // }
    }
  },
  beforeDestroy() {
    closeBluetoothAdapter();
  },
  methods: {
    async modalShow() {
      this.visible = true;
      // this.currentDeviceId = ''
      // this.connectedDeviceId = ''
      // this.isbluetoothConnected = false

      if (this.connectedDeviceId) {
        this.currentDeviceId = this.connectedDeviceId;
      }
      // if (this.bluetoothDevices.length === 0) {
      if (!this.isInit) {
        // 是否重新初始化蓝牙，注释掉就是每次都重新初始化
        // this.isInit = true
        if (this.isbluetoothConnected) {
          closeBLEConnection(this.connectedDeviceId)
            .then(() => {
              closeBluetoothAdapter();
              console.log("断开了1");
              this.initBluetooth();
            })
            .catch(() => {
              console.log("断开了2");
              closeBluetoothAdapter();
            });
        } else {
          this.initBluetooth();
        }
        // ios 第一次进入 监听蓝牙事件调用极慢，重新初始化后即可
        // if (uni.getSystemInfoSync().platform == 'ios' && !this.iosDone) {
        // 	setTimeout(() => {
        // 		this.iosDone = true
        // 		this.initBluetooth()
        // 	}, 2000)
        // }
      } else {
        const [err1, res1] = await awaitWrapper(
          startBluetoothDevicesDiscovery()
        );
        console.log("pageRes", res1);
      }
    },
    deviceSelected(device) {
      this.currentDeviceId = device.deviceId;
    },
    confirmClicked() {
      console.log("this.currentDeviceId", this.currentDeviceId);

      if (!this.currentDeviceId) {
        return this.$errTips("请选择要连接的设备");
      }

      if (!this.connectedDeviceId) {
        this.connectBluetooth();
      } else if (this.connectedDeviceId !== this.currentDeviceId) {
        closeBLEConnection(this.connectedDeviceId).then(() => {
          this.connectBluetooth();
        });
      }
      this.visible = false;
    },
    autoConnectBluetooth() {
      let timer = new Date().getTime();
      if (this.timer + 10000 > timer) {
        return this.$errTips("请勿频繁重连");
      } else {
        this.timer = timer;
      }
      autoConnectBluetooth({
        // devicesNameArr: ['OSTRAN'],
        devicesNameArr: [this.autoConnectDeviceName],
        connectionStateChangeCb: ({ deviceId, connected }) => {
          if (connected) {
            this.connectedDeviceId = deviceId;
          } else {
            this.connectedDeviceId = "";
          }
          this.$emit("connectionStateChange", connected);

          this.isbluetoothConnected = connected;

          console.log("{ deviceId, connected }", deviceId, connected);
        },
        valueChangeCb: (res) => {
          console.log("res.value", res.value);
          this.$emit("blueChange", res.value);
        },
        property: this.property,
        getDevicesArr: (devices) => {
          const deviceId = devices[0].deviceId,
            serviceId = devices[0].serviceId,
            characteristicId = devices[0].characteristicId;
          this.writeDevice = {
            deviceId,
            serviceId,
            characteristicId,
          };
        },
      });
    },
    connectBluetooth() {
      connectBluetooth({
        devicesName: this.autoConnectDeviceName,
        deviceId: this.currentDeviceId,
        valueChangeCb: (res) => {
          console.log("res.value", res.value);
          this.$emit("blueChange", res.value);
        },
        property: this.property,
        getDevicesArr: (devices) => {
          const deviceId = devices[0].deviceId,
            serviceId = devices[0].serviceId,
            characteristicId = devices[0].characteristicId;
          this.writeDevice = {
            deviceId,
            serviceId,
            characteristicId,
          };
        },
      });
    },
    initBluetooth() {
      initBluetooth({
        devicesNameArr: [this.autoConnectDeviceName],
        deviceFoundCb: (device, bluetoothDevices) => {
          console.log("bluetoothDevices", bluetoothDevices);
          this.bluetoothDevices = bluetoothDevices;
          console.log("connectBluetooth", connectBluetooth);
        },
        connectionStateChangeCb: ({ deviceId, connected }) => {
          if (connected) {
            this.connectedDeviceId = deviceId;
            console.log("");
          } else {
            this.connectedDeviceId = "";
          }
          this.$emit("connectionStateChange", connected);

          this.isbluetoothConnected = connected;

          console.log("{ deviceId, connected }", deviceId, connected);
        },
      });
    },
    cancelClicked() {
      this.visible = false;
      this.currentDeviceId = "";
    },
    writeBLECharacteristicValue(value) {
      const { deviceId, serviceId, characteristicId } = this.writeDevice;
      return writeBLECharacteristicValue({
        deviceId,
        serviceId,
        characteristicId,
        value,
      })
        .then((res) => res)
        .catch((err) => Promise.reject(err));
    },
  },
};
</script>

<style lang="stylus" scoped>
.flexCenterWrap {
  display: flex;
  align-items: center;
}

.ml16 {
  margin-left: 16rpx;
}

.listWrap {
  padding-bottom: 16rpx;
  border-bottom: 2rpx solid #E0E0E0;

  &:last-child {
    padding-bottom: 0;
    border-bottom: none;
  }
}
</style>
