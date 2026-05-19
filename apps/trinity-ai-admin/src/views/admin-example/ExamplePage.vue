<template>
  <!-- ==================== 页面容器 ==================== -->
  <div class="admin-page">
    <!-- ==================== Section Header（工具栏） ==================== -->
    <admin-section-head>
      <!-- 左侧：查询条件 -->
      <template #default>
        <el-input
          v-model="queryForm.keyword"
          placeholder="搜索关键词"
          clearable
          style="width: 200px"
          @keyup.enter="handleQuery"
        />
        <el-select
          v-model="queryForm.status"
          placeholder="状态"
          clearable
          style="width: 120px"
        >
          <el-option label="启用" value="1" />
          <el-option label="禁用" value="0" />
        </el-select>
        <el-date-picker
          v-model="dateRange"
          type="daterange"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          value-format="YYYY-MM-DD"
          style="width: 240px"
        />
        <el-button type="primary" @click="handleQuery">查询</el-button>
        <el-button @click="handleReset">重置</el-button>
      </template>

      <!-- 右侧：操作按钮 -->
      <template #actions>
        <el-button type="primary" :icon="Plus" @click="handleCreate">
          新建
        </el-button>
        <el-button :icon="Download">导出</el-button>
      </template>
    </admin-section-head>

    <!-- ==================== 表格 ==================== -->
    <el-table
      v-loading="loading"
      :data="tableData"
      class="admin-ep-table-wrap"
      element-loading-text="加载中..."
    >
      <!-- 列：仅 min-width，全部左对齐 -->
      <el-table-column label="ID" prop="id" min-width="xs" />
      <el-table-column label="名称" prop="name" min-width="primary" show-overflow-tooltip />
      <el-table-column label="状态" prop="status" min-width="xs">
        <template #default="{ row }">
          <el-tag :type="row.status === 1 ? 'success' : 'info'" size="small">
            {{ row.status === 1 ? '启用' : '禁用' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="创建时间" prop="createTime" min-width="lg" />

      <!-- 列：操作列固定在右侧 -->
      <el-table-column label="操作" width="160" fixed="right">
        <template #default="{ row }">
          <div class="admin-ep-row-actions" @click.stop>
            <el-button
              type="primary"
              link
              :icon="View"
              @click="handleView(row)"
            >
              详情
            </el-button>
            <el-button
              type="primary"
              link
              :icon="Edit"
              @click="handleEdit(row)"
            >
              编辑
            </el-button>
            <el-button
              type="danger"
              link
              :icon="Delete"
              @click="handleDelete(row)"
            >
              删除
            </el-button>
          </div>
        </template>
      </el-table-column>

      <!-- 空状态 -->
      <template #empty>
        <el-empty description="暂无数据" />
      </template>
    </el-table>

    <!-- ==================== 分页 ==================== -->
    <admin-table-pagination
      v-model:current-page="queryForm.pageNum"
      v-model:page-size="queryForm.pageSize"
      :total="total"
      @pagination="loadData"
    />

    <!-- ==================== 弹窗 ==================== -->
    <admin-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="600px"
      @confirm="handleDialogConfirm"
    >
      <el-form ref="formRef" :model="formData" label-width="100px">
        <el-form-item label="名称" prop="name">
          <el-input v-model="formData.name" placeholder="请输入名称" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="formData.status">
            <el-radio :value="1">启用</el-radio>
            <el-radio :value="0">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="formData.remark" type="textarea" rows="3" />
        </el-form-item>
      </el-form>
    </admin-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { Plus, View, Edit, Delete, Download } from '@element-plus/icons-vue'
import type { FormInstance } from 'element-plus'
import AdminSectionHead from '@/components/AdminSectionHead.vue'
import AdminTablePagination from '@/components/AdminTablePagination.vue'
import AdminDialog from '@/components/AdminDialog.vue'
import { ElMessage, ElMessageBox } from 'element-plus'

// ==================== 状态 ====================
const loading = ref(false)
const tableData = ref([])
const total = ref(0)
const dateRange = ref<[string, string] | null>(null)

// 查询表单
const queryForm = reactive({
  pageNum: 1,
  pageSize: 10,
  keyword: '',
  status: '',
})

// 弹窗
const dialogVisible = ref(false)
const dialogTitle = ref('')
const formRef = ref<FormInstance>()
const formData = reactive({
  id: '',
  name: '',
  status: 1,
  remark: '',
})

// ==================== 方法 ====================

/** 加载数据 */
async function loadData() {
  loading.value = true
  try {
    // TODO: 替换为实际 API 调用
    // const res = await api.list({ ...queryForm, dateRange })
    // tableData.value = res.rows
    // total.value = res.total

    // Mock 数据
    await new Promise(resolve => setTimeout(resolve, 500))
    tableData.value = [
      { id: 1, name: '示例数据 1', status: 1, createTime: '2026-05-19 10:00:00' },
      { id: 2, name: '示例数据 2', status: 0, createTime: '2026-05-18 10:00:00' },
    ]
    total.value = 2
  } catch (err) {
    ElMessage.error('加载数据失败')
  } finally {
    loading.value = false
  }
}

/** 查询 */
function handleQuery() {
  queryForm.pageNum = 1
  loadData()
}

/** 重置 */
function handleReset() {
  queryForm.pageNum = 1
  queryForm.pageSize = 10
  queryForm.keyword = ''
  queryForm.status = ''
  dateRange.value = null
  loadData()
}

/** 新建 */
function handleCreate() {
  dialogTitle.value = '新建'
  Object.assign(formData, { id: '', name: '', status: 1, remark: '' })
  dialogVisible.value = true
}

/** 查看 */
function handleView(row: any) {
  // TODO: 跳转到详情页或打开详情弹窗
  console.log('查看', row)
}

/** 编辑 */
function handleEdit(row: any) {
  dialogTitle.value = '编辑'
  Object.assign(formData, { ...row })
  dialogVisible.value = true
}

/** 删除 */
async function handleDelete(row: any) {
  try {
    await ElMessageBox.confirm(`确定删除「${row.name}」吗？`, '提示', {
      type: 'warning',
    })
    // TODO: 替换为实际 API 调用
    // await api.delete(row.id)
    ElMessage.success('删除成功')
    loadData()
  } catch {
    // 用户取消
  }
}

/** 弹窗确认 */
async function handleDialogConfirm() {
  try {
    await formRef.value?.validate()
    // TODO: 替换为实际 API 调用
    // if (formData.id) {
    //   await api.update(formData)
    // } else {
    //   await api.create(formData)
    // }
    ElMessage.success(formData.id ? '编辑成功' : '新建成功')
    dialogVisible.value = false
    loadData()
  } catch {
    // 表单校验失败
  }
}

// ==================== 生命周期 ====================
onMounted(() => {
  loadData()
})
</script>

<style scoped>
/* 可选：模块级样式，优先使用全局 class */
</style>
