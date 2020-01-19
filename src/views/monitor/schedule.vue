<template>
  <div class="app-container calendar-list-container">
    <div class="filter-container">
      <el-input
        v-model="listQuery.jobName"
        style="width: 200px;"
        class="filter-item"
        placeholder="请输入任务名称"
        @keyup.enter.native="handleFilter"
      />
      <el-input
        v-model="listQuery.jobGroup"
        style="width: 100px;"
        class="filter-item"
        placeholder="请输入任务分组"
        @keyup.enter.native="handleFilter"
      />
      <el-input
        v-model="listQuery.executeClass"
        style="width: 100px;"
        class="filter-item"
        placeholder="请输执行类"
        @keyup.enter.native="handleFilter"
      />
      <el-input
        v-model="listQuery.methodName"
        style="width: 100px;"
        class="filter-item"
        placeholder="请输方法名"
        @keyup.enter.native="handleFilter"
      />
      <el-select v-model="listQuery.concurrent" placeholder="是否同步" clearable>
        <el-option label="同步" :value="true" />
        <el-option label="异步" :value="false" />
      </el-select>
      <el-button
        v-waves
        class="filter-item"
        type="primary"
        icon="el-icon-search"
        @click="handleFilter"
      >查询</el-button>
    </div>
    <div class="toolbar-container">
      <el-button
        size="small"
        class="filter-item"
        style="margin-left: 10px;"
        type="primary"
        icon="el-icon-circle-plus"
        @click="handleCreate"
      >添加</el-button>
      <el-button
        :loading="batchDeleteLoading"
        size="small"
        class="filter-item"
        style="margin-left: 10px;"
        type="primary"
        icon="el-icon-delete"
        @click="handleBatchDelete"
      >删除</el-button>
      <el-button
        :loading="refreshTaskLoading"
        size="small"
        class="filter-item"
        type="primary"
        icon="el-icon-refresh"
        @click="handleRefreshTask"
      >刷新任务</el-button>
    </div>

    <el-table
      :key="tableKey"
      v-loading="listLoading"
      :data="list"
      element-loading-text="给我一点时间"
      border
      fit
      highlight-current-row
      style="width: 100%"
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" align="center" />
      <el-table-column width="250" align="center" label="任务名称">
        <template slot-scope="scope">
          <span>{{ scope.row.jobName }}</span>
        </template>
      </el-table-column>
      <el-table-column width="120" align="center" label="任务分组">
        <template slot-scope="scope">
          <span>{{ scope.row.jobGroup }}</span>
        </template>
      </el-table-column>
      <el-table-column width="100" align="center" label="执行类">
        <template slot-scope="scope">
          <span>{{ scope.row.executeClass }}</span>
        </template>
      </el-table-column>
      <el-table-column width="80" align="center" label="方法名">
        <template slot-scope="scope">
          <span>{{ scope.row.methodName }}</span>
        </template>
      </el-table-column>
      <el-table-column width="100" align="center" label="执行表达式">
        <template slot-scope="scope">
          <span>{{ scope.row.cronExpression }}</span>
        </template>
      </el-table-column>
      <el-table-column width="80" align="center" label="任务状态">
        <template slot-scope="scope">
          <span v-if="scope.row.jobStatus=='1'">启动</span>
          <span v-if="scope.row.jobStatus=='0'">停止</span>
        </template>
      </el-table-column>
      <el-table-column width="80" align="center" label="是否同步">
        <template slot-scope="scope">
          <span v-if="scope.row.concurrent">同步</span>
          <span v-if="scope.row.concurrent==false">异步</span>
        </template>
      </el-table-column>

      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button
            v-if="scope.row.jobStatus=='0'"
            type="primary"
            size="mini"
            @click="handleChangeJobStatus(scope.row, 'start', '启动')"
          >开始</el-button>
          <el-button
            v-if="scope.row.jobStatus=='1'"
            type="danger"
            size="mini"
            @click="handleChangeJobStatus(scope.row, 'stop', '停止')"
          >停止</el-button>
          <el-button type="primary" size="mini" @click="handleRefresh(scope.row)">刷新</el-button>
          <el-button type="primary" size="mini" @click="handleUpdate(scope.row)">编辑</el-button>
        </template>
      </el-table-column>
    </el-table>

    <div class="pagination-container">
      <el-pagination
        :current-page.sync="listQuery.page"
        :page-sizes="[10,20,30, 50]"
        :page-size="listQuery.limit"
        :total="total"
        background
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>

    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible">
      <el-form
        ref="dataForm"
        :rules="rules"
        :model="temp"
        label-position="left"
        label-width="120px"
        style="width: 90%; margin-left:50px;"
      >
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="任务名称" prop="jobName">
              <el-input v-model="temp.jobName" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="任务分组" prop="jobGroup">
              <el-input v-model="temp.jobGroup" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="加载方式" prop="loadWay">
              <el-radio
                v-for="item in loadwayDict"
                :key="'type' + item.label"
                v-model="temp.loadWay"
                :label="item.value"
              >{{ item.label }}</el-radio>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="执行类" prop="executeClass">
              <el-input v-model="temp.executeClass" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="方法名" prop="methodName">
              <el-input v-model="temp.methodName" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="方法参数" prop="methodParams">
              <el-input v-model="temp.methodParams" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="cron表达式" prop="cronExpression">

              <el-input v-model="temp.cronExpression" />
              <template>
                <el-popover
                  placement="top-start"
                  title="标题"
                  width="500"
                  trigger="hover"
                  content="这是一段内容,这是一段内容,这是一段内容,这是一段内容。"
                >
                  <span>
                    (1)0 0 2 1 * ? *   表示在每月的1日的凌晨2点调整任务

                    (2)0 15 10 ? * MON-FRI   表示周一到周五每天上午10:15执行作业

                    (3)0 15 10 ? 6L 2002-2006   表示2002-2006年的每个月的最后一个星期五上午10:15执行作

                    (4)0 0 10,14,16 * * ?   每天上午10点，下午2点，4点

                    (5)0 0/30 9-17 * * ?   朝九晚五工作时间内每半小时

                    (6)0 0 12 ? * WED    表示每个星期三中午12点

                    (7)0 0 12 * * ?   每天中午12点触发

                    (8)0 15 10 ? * *    每天上午10:15触发

                    (9)0 15 10 * * ?     每天上午10:15触发

                    (10)0 15 10 * * ? *    每天上午10:15触发

                    (11)0 15 10 * * ? 2005    2005年的每天上午10:15触发

                    (12)0 * 14 * * ?     在每天下午2点到下午2:59期间的每1分钟触发

                    (13)0 0/5 14 * * ?    在每天下午2点到下午2:55期间的每5分钟触发

                    (14)0 0/5 14,18 * * ?     在每天下午2点到2:55期间和下午6点到6:55期间的每5分钟触发

                    (15)0 0-5 14 * * ?    在每天下午2点到下午2:05期间的每1分钟触发

                    (16)0 10,44 14 ? 3 WED    每年三月的星期三的下午2:10和2:44触发

                    (17)0 15 10 ? * MON-FRI    周一至周五的上午10:15触发

                    (18)0 15 10 15 * ?    每月15日上午10:15触发

                    (19)0 15 10 L * ?    每月最后一日的上午10:15触发

                    (20)0 15 10 ? * 6L    每月的最后一个星期五上午10:15触发

                    (21)0 15 10 ? * 6L 2002-2005   2002年至2005年的每月的最后一个星期五上午10:15触发

                    (22)0 15 10 ? * 6#3   每月的第三个星期五上午10:15触发
                  </span>
                  <el-button slot="reference">常用表达式</el-button>
                </el-popover>
              </template>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="是否同步" prop="concurrent">
              <el-radio
                v-for="item in concurrentDict"
                :key="'type' + item.label"
                v-model="temp.concurrent"
                :label="item.value"
              >{{ item.label }}</el-radio>
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="任务描述">
          <el-input
            v-model="temp.description"
            :autosize="{ minRows: 2, maxRows: 4}"
            type="textarea"
            placeholder="请输入任务描述"
          />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">取消</el-button>
        <el-button v-if="dialogStatus=='create'" type="primary" @click="createData">保存</el-button>
        <el-button v-else type="primary" @click="updateData">保存</el-button>
      </div>
    </el-dialog>

  </div>
</template>

<script>
import {
  listSchedule,
  createSchedule,
  deleteSchedule,
  batchDeleteSchedule,
  updateSchedule,
  refreshTask,
  refreshSchedule,
  changeJobStatus
} from '@/api/monitor/schedule'
import waves from '@/directive/waves' // 水波纹指令

const defaultScheduleJob = {
  id: undefined,
  jobName: '',
  cronExpression: '',
  executeClass: '',
  methodName: '',
  methodParams: '',
  misfirePolicy: '',
  loadWay: '1',
  concurrent: true,
  description: '',
  jobStatus: '0',
  jobGroup: ''
}

export default {
  name: 'SysScheduleList',
  directives: {
    waves
  },
  data() {
    return {
      tableKey: 0,
      list: null,
      total: null,
      listLoading: true,
      refreshTaskLoading: false,
      listQuery: {
        page: 1,
        limit: 10,
        jobName: ''
      },
      showReviewer: false,
      temp: defaultScheduleJob,
      dialogFormVisible: false,
      dialogStatus: '',
      textMap: {
        update: '编辑任务',
        create: '添加任务'
      },
      dialogPvVisible: false,
      batchDeleteLoading: false,
      pvData: [],
      multipleSelection: [],
      rules: {
        jobName: [
          { required: true, message: '请输入任务名称！', trigger: 'blur' }
        ],
        jobGroup: [
          { required: true, message: '请输入任务分组！', trigger: 'blur' }
        ],
        executeClass: [
          { required: true, message: '请输入执行类！', trigger: 'blur' }
        ],
        loadWay: [
          { required: true, message: '请选择加载方式！', trigger: 'change' }
        ],
        concurrent: [
          { required: true, message: '请选择是否同步！', trigger: 'change' }
        ],
        methodName: [
          { required: true, message: '请输入方法名！', trigger: 'blur' }
        ],
        cronExpression: [
          { required: true, message: '请输入cron表达式！', trigger: 'blur' }
        ]
      },
      loadwayDict: [
        { id: 1, value: '1', label: 'spring容器' },
        { id: 0, value: '0', label: 'java反射机制' }
      ],
      concurrentDict: [
        { id: 1, value: true, label: '同步' },
        { id: 0, value: false, label: '异步' }
      ]
    }
  },
  created() {
    this.getList()
  },
  methods: {
    getList() {
      this.listLoading = true
      listSchedule(this.listQuery).then(response => {
        this.list = response.data.records
        this.total = response.data.total
        this.listLoading = false
      })
    },
    handleFilter() {
      this.listQuery.page = 1
      this.getList()
    },
    handleSizeChange(val) {
      this.listQuery.limit = val
      this.getList()
    },
    handleCurrentChange(val) {
      this.listQuery.page = val
      this.getList()
    },
    handleModifyStatus(row, status) {
      this.$message({
        message: '操作成功',
        type: 'success'
      })
      row.status = status
    },
    handleCreate() {
      this.temp = { ...defaultScheduleJob }
      this.dialogStatus = 'create'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    createData() {
      this.$refs['dataForm'].validate(valid => {
        if (valid) {
          createSchedule(this.temp).then(response => {
            if (response.code !== 200) {
              this.$message({
                message: response.message,
                type: 'error'
              })
            } else {
              this.dialogFormVisible = false
              this.$notify({
                title: '成功',
                message: '创建成功',
                type: 'success',
                duration: 2000
              })
              this.getList()
            }
          })
        }
      })
    },
    handleUpdate(row) {
      this.temp = Object.assign({}, row) // copy obj
      this.dialogStatus = 'update'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    updateData() {
      this.$refs['dataForm'].validate(valid => {
        if (valid) {
          const tempData = Object.assign({}, this.temp)
          updateSchedule(tempData).then(response => {
            if (response.code !== 200) {
              this.$message({
                message: response.message,
                type: 'error'
              })
            } else {
              this.dialogFormVisible = false
              this.$notify({
                title: '成功',
                message: '创建成功',
                type: 'success',
                duration: 2000
              })
              this.getList()
            }
          })
        }
      })
    },
    handleSelectionChange(val) {
      this.multipleSelection = val
    },
    handleDelete(row) {
      this.$confirm('确认要删除任务么?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        deleteSchedule(row.id).then(response => {
          if (response.code === 200) {
            this.$notify({
              title: '成功',
              message: '删除成功',
              type: 'success',
              duration: 2000
            })
            this.getList()
          } else {
            this.$notify({
              title: '失败',
              message: response.message,
              type: 'error',
              duration: 2000
            })
          }
        })
      })
    },
    handleRefresh(row) {
      this.$confirm('确认要更新任务么?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        refreshSchedule(row.id).then(response => {
          if (response.code === 200) {
            this.$notify({
              title: '成功',
              message: '更新成功',
              type: 'success',
              duration: 2000
            })
            this.getList()
          } else {
            this.$notify({
              title: '失败',
              message: response.message,
              type: 'error',
              duration: 2000
            })
          }
        })
      })
    },
    handleChangeJobStatus(row, cmd, cmdLabel) {
      this.$confirm('你确定要' + cmdLabel + '该计划任务么?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        changeJobStatus(row.id, cmd).then(response => {
          if (response.code === 200) {
            this.$notify({
              title: '成功',
              message: '更新成功',
              type: 'success',
              duration: 2000
            })
            this.getList()
          } else {
            this.$notify({
              title: '失败',
              message: response.message,
              type: 'error',
              duration: 2000
            })
          }
        })
      })
    },
    handleRefreshTask() {
      refreshTask()
        .then(() => {
          this.$notify({
            title: '成功',
            message: '提交成功',
            type: 'success',
            duration: 2000
          })
          this.$refs.multipleTable.clearSelection()
          this.refreshTaskLoading = false
        })
        .catch(() => {
          this.refreshTaskLoading = false
        })
    },
    handleBatchDelete() {
      if (this.multipleSelection.length) {
        this.batchDeleteLoading = true
        const list = this.multipleSelection
        var ids = []
        list.forEach(function(value, index, array) {
          ids.push(value.id)
        })
        var idsStr = ids.join(',')
        this.$confirm('你确定要删除该计划任务么?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          batchDeleteSchedule(idsStr)
            .then(() => {
              this.$notify({
                title: '成功',
                message: '提交成功',
                type: 'success',
                duration: 2000
              })
              this.getList()
              this.batchDeleteLoading = false
            })
            .catch(() => {
              this.batchDeleteLoading = false
            })
        })
      } else {
        this.$message({
          message: '至少选择一条任务',
          type: 'warning'
        })
      }
    }
  }
}
</script>
