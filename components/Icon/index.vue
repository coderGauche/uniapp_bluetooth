<!--
 * @Author: Gauche楽
 * @Date: 2023-07-31 03:00:21
 * @LastEditors: Gauche楽
 * @LastEditTime: 2023-07-31 03:00:27
 * @FilePath: /uniapp_bluetooth/components/Icon/index.vue
-->
<template>
  <text
    class="iconDefault village_mode"
    :class="'iconfont ' + name"
    :style="iconStyles"
  ></text>
</template>

<script>
import { addUnitToNumberVal, objEntriesToArray } from "@/libs/utils.js";
export default {
  props: {
    name: {
      type: String,
      default: "",
    },
    size: {
      type: String | Number,
      default: "32rpx",
    },
    color: {
      type: String,
      default: "inherit",
    },
    extraStyles: {
      type: Object,
      default() {
        return {};
      },
    },
  },
  computed: {
    iconStyles() {
      const fontSize = addUnitToNumberVal(this.size) || "";
      const color = this.color;
      const obj = {
        fontSize,
        color,
      };
      return objEntriesToArray({ ...obj, ...this.extraStyles });
    },
  },
};
</script>

<style scoped>
.iconfont {
  /* font-size: 32rpx; */
  font-family: "iconfont";
  font-style: normal;
}

.iconDefault {
  font-weight: 100;
}
</style>