<template>
  <div>
    <el-card title="修改密码">
      <el-form :model="form" label-width="120px">
        <el-form-item label="旧密码">
          <el-input v-model="form.oldPassword" type="password" placeholder="请输入旧密码" />
        </el-form-item>
        <el-form-item label="新密码">
          <el-input v-model="form.newPassword" type="password" placeholder="请输入新密码（至少6位）" />
        </el-form-item>
        <el-form-item label="确认新密码">
          <el-input v-model="form.confirmPassword" type="password" placeholder="请再次输入新密码" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleChangePassword" :loading="loading">确认修改</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import { changePassword } from '@/utils/api'

const loading = ref(false)
const form = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const handleChangePassword = async () => {
  if (!form.oldPassword) {
    ElMessage.error('请输入旧密码')
    return
  }
  if (!form.newPassword) {
    ElMessage.error('请输入新密码')
    return
  }
  if (form.newPassword.length < 6) {
    ElMessage.error('新密码长度至少6位')
    return
  }
  if (form.newPassword !== form.confirmPassword) {
    ElMessage.error('两次输入的密码不一致')
    return
  }
  
  loading.value = true
  try {
    const res = await changePassword(form.oldPassword, form.newPassword)
    if (res.success) {
      ElMessage.success(res.message)
      setTimeout(() => {
        localStorage.removeItem('admin_token')
        window.location.href = '/login'
      }, 1500)
    } else {
      ElMessage.error(res.message)
    }
  } catch (e) {
    ElMessage.error('修改密码失败')
  } finally {
    loading.value = false
  }
}
</script>