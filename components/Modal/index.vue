<template>
  <view v-if="visible" class="modalBg village_mode" @touchmove.stop.prevent>
    <view class="contentWrap">
      <view class="modalHeader">
        {{ title }}
      </view>
      <scroll-view scroll-y="true">
        <view class="modalBody">
          <slot></slot>
        </view>
      </scroll-view>
      <view v-if="isSingleButton" class="modalBottom">
        <view class="bottomClose" @click="cancel"> 关闭 </view>
      </view>
      <view v-else class="modalBottom">
        <view class="bottomLeft" @click="cancel"> 取消 </view>
        <view class="bottomRight" @click="confirm"> 确认 </view>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  props: {
    title: {
      type: String,
      default: "",
    },
    visible: {
      type: Boolean,
      default: false,
    },
    isSingleButton: {
      type: Boolean,
      default: false,
    },
  },
  methods: {
    cancel() {
      this.$emit("cancel");
    },
    confirm() {
      this.$emit("confirm");
    },
  },
};
</script>

<style lang="stylus" scoped>
.modalBg {
  background-color: rgba(0, 0, 0, 0.6);
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 3;
}

.contentWrap {
  background-color: #FFFFFF;
  width: 622rpx;
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  border-radius: 12rpx;
  overflow: hidden;
}

.modalHeader {
  color: #232323;
  font-size: 32rpx;
  text-align: center;
  margin-top: 48rpx;
  font-weight: bolder;
}

.modalBody {
  padding: 48rpx;
  max-height: 600rpx;
  // overflow auto
}

.modalBottom {
  flex: 0 0;
  width: 96rpx;
  border-top: 2rpx solid #DCDEE3;
  display: flex;
  width: 100%;
}

.bottomLeft {
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 1 1;
  color: #666666;
  font-size: 32rpx;
  padding: 32rpx 0;

  &:active {
    background-color: #E0E0E0;
  }
}

.bottomRight {
  color: #FDA010;
  font-size: 32rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 1 1;
  border-left: 2rpx solid #DCDEE3;
  padding: 32rpx 0;

  &:active {
    background-color: #E0E0E0;
  }
}

.bottomClose {
  font-size: 32rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 1 1;
  border-left: 2rpx solid #DCDEE3;
  padding: 32rpx 0;

  &:active {
    background-color: #E0E0E0;
  }
}
</style>
