<template>
  <div>
    <el-card>
      <div style="margin-bottom: 20px;">
        <el-button type="primary" @click="handlePaste">📋 粘贴数据</el-button>
        <el-button @click="handleAddRow">+ 添加一行</el-button>
        <span style="margin-left: 20px; color: #999;">支持格式：卡号,密码（每行一条）</span>
      </div>
      <el-table :data="cardList" border>
        <el-table-column label="卡号">
          <template #default="{ row }">
            <el-input v-model="row.cardNo" placeholder="卡号" />
          </template>
        </el-table-column>
        <el-table-column label="密码">
          <template #default="{ row }">
            <el-input v-model="row.password" placeholder="密码" />
          </template>
        </el-table-column>
        <el-table-column label="操作">
          <template #default="{ row }">
            <el-button v-if="cardList.length > 1" type="danger" size="small" @click="handleRemoveRow(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <div style="margin-top: 20px; display: flex; justify-content: flex-end;">
        <el-button type="primary" @click="handleImport" :loading="loading">确认导入</el-button>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { importCards } from '@/utils/api'

const cardList = ref([{ cardNo: '', password: '' }])
const loading = ref(false)

const handleAddRow = () => {
  cardList.value.push({ cardNo: '', password: '' })
}

const handleRemoveRow = (row) => {
  const index = cardList.value.indexOf(row)
  if (index > -1) {
    cardList.value.splice(index, 1)
  }
}

const handlePaste = async () => {
  try {
    const text = await navigator.clipboard.readText()
    const lines = text.split('\n').filter(line => line.trim())
    const cards = []
    lines.forEach(line => {
      const parts = line.split(/[, \t]+/)
      if (parts.length >= 2) {
        cards.push({ cardNo: parts[0].trim(), password: parts[1].trim() })
      }
    })
    if (cards.length > 0) {
      cardList.value = cards
    }
  } catch (e) {
    alert('读取剪贴板失败，请手动输入')
  }
}

const handleImport = async () => {
  const validCards = cardList.value.filter(c => c.cardNo && c.password)
  if (validCards.length === 0) {
    alert('请填写卡号和密码')
    return
  }
  loading.value = true
  try {
    const res = await importCards(validCards)
    if (res.success) {
      alert(`导入成功：${res.imported}条，跳过${res.skipped}条`)
      cardList.value = [{ cardNo: '', password: '' }]
    }
  } catch (e) {
    alert('导入失败')
  } finally {
    loading.value = false
  }
}
</script>