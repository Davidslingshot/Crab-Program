<template>
  <div>
    <div style="display: flex; justify-content: space-between; margin-bottom: 20px;">
      <el-select v-model="statusFilter" style="width: 120px">
        <el-option label="全部" value="all" />
        <el-option label="待处理" value="pending" />
        <el-option label="已发货" value="shipped" />
        <el-option label="已完成" value="completed" />
      </el-select>
      <el-button type="primary" @click="handleExport">导出订单</el-button>
    </div>
    <el-table :data="orders" border>
      <el-table-column prop="orderId" label="订单号" />
      <el-table-column prop="cardNo" label="卡号" />
      <el-table-column prop="name" label="收货人" />
      <el-table-column prop="phone" label="电话" />
      <el-table-column prop="address" label="地址" show-overflow-tooltip />
      <el-table-column prop="remark" label="备注" />
      <el-table-column prop="createTime" label="创建时间" />
      <el-table-column prop="status" label="状态">
        <template #default="{ row }">
          <el-tag :type="getStatusType(row.status)">{{ getStatusText(row.status) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作">
        <template #default="{ row }">
          <el-button v-if="row.status === 'pending'" type="primary" size="small" @click="handleUpdateStatus(row.orderId, 'shipped')">发货</el-button>
          <el-button v-if="row.status === 'shipped'" type="success" size="small" @click="handleUpdateStatus(row.orderId, 'completed')">完成</el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination
      v-if="total > 10"
      :total="total"
      :page-size="10"
      layout="total, prev, pager, next"
      @current-change="handlePageChange"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { getOrders, updateOrderStatus, exportOrders } from '@/utils/api'

const orders = ref([])
const total = ref(0)
const statusFilter = ref('all')

const loadOrders = async () => {
  const res = await getOrders(statusFilter.value)
  if (res.success) {
    orders.value = res.data
    total.value = res.data.length
  }
}

const getStatusText = (status) => {
  const map = { pending: '待处理', shipped: '已发货', completed: '已完成' }
  return map[status] || status
}

const getStatusType = (status) => {
  const map = { pending: 'warning', shipped: 'primary', completed: 'success' }
  return map[status] || 'info'
}

const handleUpdateStatus = async (orderId, status) => {
  const res = await updateOrderStatus(orderId, status)
  if (res.success) {
    await loadOrders()
  }
}

const handleExport = async () => {
  try {
    const blob = await exportOrders()
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `orders_${Date.now()}.csv`
    a.click()
    URL.revokeObjectURL(url)
  } catch (e) {
    console.error('导出失败', e)
  }
}

const handlePageChange = () => {}

onMounted(loadOrders)
watch(statusFilter, loadOrders)
</script>