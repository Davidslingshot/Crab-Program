<template>
  <div>
    <div style="display: flex; gap: 10px; margin-bottom: 20px;">
      <el-input v-model="searchText" placeholder="搜索卡号" style="width: 200px" @keyup.enter="loadCards" />
      <el-select v-model="statusFilter" style="width: 120px">
        <el-option label="全部" value="all" />
        <el-option label="未使用" value="unused" />
        <el-option label="已使用" value="used" />
      </el-select>
      <el-button type="primary" @click="loadCards">查询</el-button>
    </div>
    <el-table :data="cards" border>
      <el-table-column prop="cardNo" label="卡号" />
      <el-table-column prop="password" label="密码" />
      <el-table-column prop="status" label="状态">
        <template #default="{ row }">
          <el-tag :type="row.status === 'used' ? 'success' : 'warning'">
            {{ row.status === 'used' ? '已使用' : '未使用' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="orderId" label="关联订单" />
      <el-table-column prop="createdAt" label="创建时间" />
      <el-table-column label="操作">
        <template #default="{ row }">
          <el-button v-if="row.status === 'unused'" type="danger" size="small" @click="handleDelete(row.cardNo)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { getCards, deleteCard } from '@/utils/api'

const cards = ref([])
const searchText = ref('')
const statusFilter = ref('all')

const loadCards = async () => {
  const params = {}
  if (searchText.value) params.search = searchText.value
  if (statusFilter.value !== 'all') params.status = statusFilter.value
  const res = await getCards(params)
  if (res.success) {
    cards.value = res.data
  }
}

const handleDelete = async (cardNo) => {
  const res = await deleteCard(cardNo)
  if (res.success) {
    await loadCards()
  }
}

onMounted(loadCards)
watch([searchText, statusFilter], loadCards)
</script>