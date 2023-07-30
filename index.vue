<template>
  <div class="village_mode">
    <BgWrap color="#F6F9FE"></BgWrap>
    <view class="wrap-header flex-between alignment">
      <view class="">
        <Bluetooth
          ref="bluetooth"
          @connectionStateChange="connectionStateChange"
          autoConnectDeviceName="MPT-II"
        />
      </view>
      <view
        class="reconnectBtn"
        @click="reconnectBluetooth"
        style="color: #323848"
        >重新连接</view
      >
    </view>
  </div>
</template>

<script>
import BgWrap from "@/components/BgWrap/index.vue";
import tsc from "@/salesman/components/gprint/tsc.js";
import Bluetooth from "@/salesman/components/Bluetooth/bluetooth.vue";
export default {
  components: {
    BgWrap,
    Bluetooth,
  },
  data() {
    return {
      connect_status: "",
    };
  },
  methods: {
    init() {},
    reconnectBluetooth() {
      this.$refs.bluetooth.autoConnectBluetooth();
    },
    connectionStateChange(connected) {
      console.log("connected", connected);
      this.connect_status = connected;
    },
    senBleLabel() {
      if (this.btnDisable == true) {
        return false;
      }
      //标签模式
      if (this.status === 0 || this.status === 2 || this.status === false) {
        console.log("no点击");
        let options = {
          msg: "请检查打印机是否正常~",
          duration: 2000,
        };
        this.$refs.toast.showTips(options);
        return false;
      } else {
        this.btnDisable = true;
        this.dayin();
        var t = 10;
        var that = this;
        var id = setInterval(function () {
          if (t > 0) {
            t--;
            that.btn_text = "(" + t + "s)";
            that.btnDisable = true;
          } else {
            clearInterval(id);
            that.btn_text = "打印";
            that.btnDisable = false;
          }
        }, 1000);
      }
    },
    dayin() {
      var command = tsc.createNew();
      console.log(command);
      this.setContent(command);
      this.senBlData(
        "uni.getStorageSync('printer').deviceId",
        "serviceId",
        "characteristicId",
        command.getData()
      );
    },
    setContent(command) {
      command.setTexta("");
      command.setTexta("");
      command.setTexta("");
      command.transport();
      command.setTexta("-------------------------------");
      command.setTexta("");
      command.transport_id(this.transport_edit.id);
      command.setTexta("");
      command.transport_store(this.transport_edit.store.name);
      command.setTexta("");
      command.transport_store_userName(this.transport_edit.user.name);
      command.setTexta("");
      command.transport_logistics_name(this.transport_edit.operator.name);

      command.setTexta("-------------------------------");
      this.order_items.map((item) => {
        command.goods(
          item.goods_name,
          item.count + (item.flag == 0 ? "千克" : "件 ")
        );
        command.setTexta("");
      });
      command.setTexta("-------------------------------");
      command.total(Number(this.total).toFixed(2) + "千克");
      command.setTexta("");
      command.transport_time(this.fmtDate(this.transport_edit.time));
      command.setTexta("");
      command.setTexta("");
    },
    senBlData(deviceId, serviceId, characteristicId, uint8Array) {
      console.log(
        "************deviceId = [" +
          deviceId +
          "]  serviceId = [" +
          serviceId +
          "] characteristics=[" +
          characteristicId +
          "]"
      );
      var uint8Buf = Array.from(uint8Array);

      function split_array(datas, size) {
        var result = {};
        var j = 0;
        for (var i = 0; i < datas.length; i += size) {
          result[j] = datas.slice(i, i + size);
          j++;
        }
        console.log(result);
        return result;
      }
      var sendloop = split_array(uint8Buf, 20);
      // console.log(sendloop.length)
      var that = this;
      function realWriteData(sendloop, i) {
        var data = sendloop[i];
        if (typeof data === "undefined") {
          return;
        }
        console.log("第【" + i + "】次写数据" + data);
        var buffer = new ArrayBuffer(data.length);
        var dataView = new DataView(buffer);
        for (var j = 0; j < data.length; j++) {
          dataView.setUint8(j, data[j]);
        }
        that.$refs.bluetooth
          .writeBLECharacteristicValue(buffer)
          .then(() => realWriteData(sendloop, i + 1))
          .catch((err) => {
            console.log(err);
            realWriteData(sendloop, i + 1);
          });
      }
      var i = 0;
      realWriteData(sendloop, i);
    },
  },
};
</script>

<style scoped lang="scss">
</style>
