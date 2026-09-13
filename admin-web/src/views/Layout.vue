<template>
  <el-container style="height: 100vh">
    <el-aside width="200px" style="background: #2a3f5f">
      <div class="logo">蟹卡管理</div>
      <el-menu :default-active="activeMenu" background-color="#2a3f5f" text-color="#fff" active-text-color="#409eff">
        <el-menu-item index="/orders" @click="navigate('/orders')">
          <el-icon><ShoppingCart /></el-icon>
          <span>订单管理</span>
        </el-menu-item>
        <el-menu-item index="/cards" @click="navigate('/cards')">
          <el-icon><CreditCard /></el-icon>
          <span>卡片管理</span>
        </el-menu-item>
        <el-menu-item index="/import" @click="navigate('/import')">
          <el-icon><Upload /></el-icon>
          <span>批量导入</span>
        </el-menu-item>
        <el-menu-item index="/change-password" @click="navigate('/change-password')">
          <el-icon><Lock /></el-icon>
          <span>修改密码</span>
        </el-menu-item>
      </el-menu>
    </el-aside>
    <el-container>
      <el-header style="background: #fff; display: flex; justify-content: space-between; align-items: center; padding: 0 20px;">
        <span>蟹卡提货管理后台</span>
        <el-button type="text" @click="handleLogout">退出登录</el-button>
      </el-header>
      <el-main>
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ShoppingCart, CreditCard, Upload, Lock } from '@element-plus/icons-vue'

const router = useRouter()
const route = useRoute()

const activeMenu = computed(() => route.path)

const navigate = (path) => {
  router.push(path)
}

const handleLogout = () => {
  localStorage.removeItem('admin_token')
  router.push('/login')
}
</script>

<style scoped>
.logo {
  padding: 20px;
  font-size: 18px;
  color: #fff;
  text-align: center;
  border-bottom: 1px solid #3a5f8f;
}

.el-header {
  border-bottom: 1px solid #eee;
}
</style>