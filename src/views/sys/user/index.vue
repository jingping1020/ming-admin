<template>
  <div class="app-container calendar-list-container">
    <div class="filter-container">
      <el-input
        v-model="listQuery.realName"
        style="width: 200px;"
        class="filter-item"
        placeholder="请输入姓名"
        @keyup.enter.native="handleFilter"
      />
      <el-input
        v-model="listQuery.userName"
        style="width: 200px;"
        class="filter-item"
        placeholder="请输入用户名"
        @keyup.enter.native="handleFilter"
      />
      <el-input
        v-model="listQuery.phone"
        style="width: 200px;"
        class="filter-item"
        placeholder="请输入手机号码"
        @keyup.enter.native="handleFilter"
      />
      <el-button
        v-waves
        class="filter-item"
        type="primary"
        icon="el-icon-search"
        @click="handleFilter"
      >查询</el-button>
      <el-button
        class="filter-item"
        style="margin-left: 10px;"
        type="primary"
        icon="el-icon-edit"
        @click="handleCreate"
      >添加</el-button>
      <el-button
        v-waves
        :loading="downloadLoading"
        class="filter-item"
        type="primary"
        icon="el-icon-download"
        @click="handleDownload"
      >导出</el-button>
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
    >
      <el-table-column width="150" align="center" label="姓名">
        <template slot-scope="scope">
          <span>{{ scope.row.realName }}</span>
        </template>
      </el-table-column>
      <el-table-column width="120" label="用户名">
        <template slot-scope="scope">
          <span>{{ scope.row.userName }}</span>
        </template>
      </el-table-column>
      <el-table-column width="120" align="center" label="联系电话">
        <template slot-scope="scope">
          <span>{{ scope.row.phone }}</span>
        </template>
      </el-table-column>
      <el-table-column width="160" align="center" label="邮箱">
        <template slot-scope="scope">
          <span>{{ scope.row.email }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button type="primary" size="mini" @click="handleUpdate(scope.row)">编辑</el-button>
          <el-button size="mini" type="danger" @click="handleDelete(scope.row)">删除</el-button>
          <el-button
            size="mini"
            type="primary"
            style="width: 80px;"
            @click="toAssignRoles(scope.row)"
          >设置角色</el-button>
          <el-button
            size="mini"
            type="primary"
            style="width: 80px;"
            @click="handleModifyPassword(scope.row)"
          >重置密码</el-button>
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
        label-width="100px"
        style="width: 400px; margin-left:50px;"
      >
        <el-form-item label="姓名" prop="realName">
          <el-input v-model="temp.realName" />
        </el-form-item>
        <el-form-item label="用户名" prop="userName">
          <el-input v-model="temp.userName" />
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="temp.email" />
        </el-form-item>
        <el-form-item label="手机号码" prop="phone">
          <el-input v-model="temp.phone" />
        </el-form-item>
        <el-form-item v-if="temp.id==undefined" label="初始密码" prop="password">
          <el-input v-model="temp.password" type="password" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">取消</el-button>
        <el-button v-if="dialogStatus=='create'" type="primary" @click="createData">添加</el-button>
        <el-button v-else type="primary" @click="updateData">保存</el-button>
      </div>
    </el-dialog>

    <el-dialog :visible.sync="dialogFormPasswordVisible" title="修改密码">
      <el-form
        ref="dataModifyForm"
        :rules="modifyPasswordRules"
        :model="modifyPassword"
        label-position="left"
        label-width="100px"
        style="width: 400px; margin-left:50px;"
      >
        <el-form-item label="初始密码" prop="password">
          <el-input v-model="modifyPassword.password" type="password" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormPasswordVisible = false">取消</el-button>
        <el-button type="primary" @click="postModifyPassword">修改密码</el-button>
      </div>
    </el-dialog>

    <el-dialog :visible.sync="dialogFormRolesVisible" title="设置角色">
      <el-transfer
        v-model="userRoleIds"
        :filterable="true"
        :props="{key: 'id',label: 'name'}"
        :titles="['可选角色', '已有角色']"
        :button-texts="['撤回', '设置']"
        :format="{noChecked: '${total}', hasChecked: '${checked}/${total}'}"
        :data="roleList"
        @change="handleChangeRoles"
      />
    </el-dialog>
  </div>
</template>

<script>
import {
  listUser,
  createUser,
  deleteUser,
  updateUser,
  modifyPassword,
  exportUser
} from '@/api/sys/user'
import { listAllRole } from '@/api/sys/role'
import {
  fetchUserRoleIds,
  insertByUserId,
  deleteByUserId
} from '@/api/sys/userRole'
import waves from '@/directive/waves' // 水波纹指令
import { parseTime } from '@/utils'
// import { getDictList } from '@/utils/dict'

export default {
  name: 'SysUserList',
  directives: {
    waves
  },
  filters: {
    statusFilter(status) {
      const statusMap = {
        published: 'success',
        draft: 'info',
        deleted: 'danger'
      }
      return statusMap[status]
    }
  },
  data() {
    return {
      tableKey: 0,
      list: null,
      total: null,
      listLoading: true,
      listQuery: {
        page: 1,
        limit: 10,
        importance: undefined,
        title: undefined,
        type: undefined,
        sort: '+id'
      },
      sexOptions: null, // getDictList('sex'),
      showReviewer: false,
      temp: {
        id: undefined,
        realName: '',
        userName: '',
        email: '',
        phone: '',
        password: ''
      },
      dialogFormVisible: false,
      dialogStatus: '',
      textMap: {
        update: '编辑用户',
        create: '创建用户'
      },
      dialogPvVisible: false,
      pvData: [],
      rules: {
        realName: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
        userName: [
          { required: true, message: '请输入用户名', trigger: 'blur' }
        ],
        email: [{ required: true, message: '请输入邮箱', trigger: 'blur' }],
        phone: [{ required: true, message: '请输入手机号码', trigger: 'blur' }],
        password: [{ required: true, message: '请输入密码', trigger: 'blur' }]
      },
      downloadLoading: false,
      dialogFormRolesVisible: false,
      roleList: [],
      userRoleIds: [],
      selectCurentUserId: null,
      modifyPassword: {
        id: undefined,
        password: undefined
      },
      dialogFormPasswordVisible: false,
      modifyPasswordRules: {
        password: [{ required: true, message: '请输入密码', trigger: 'blur' }]
      }
    }
  },
  created() {
    this.getList()
    this.getUsableRoleList()
  },
  methods: {
    getList() {
      this.listLoading = true
      listUser(this.listQuery).then(response => {
        this.list = response.data.records
        this.total = response.data.total
        this.listLoading = false
      })
    },
    getUsableRoleList() {
      listAllRole().then(response => {
        this.roleList = response.data
      })
    },
    getUserRoleIds(userId) {
      fetchUserRoleIds(userId).then(response => {
        this.userRoleIds = response.data
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
    resetTemp() {
      this.temp = {
        id: undefined,
        realName: '',
        userName: '',
        email: '',
        phone: '',
        password: ''
      }
    },
    handleCreate() {
      this.resetTemp()
      this.dialogStatus = 'create'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    createData() {
      this.$refs['dataForm'].validate(valid => {
        if (valid) {
          createUser(this.temp).then(response => {
            if (response.code === 200) {
              this.getList()
              this.$notify({
                title: '成功',
                message: response.message,
                type: 'success',
                duration: 2000
              })
            } else {
              this.$notify.error({
                title: '失败',
                message: response.message,
                duration: 2000
              })
            }
          })
        }
      })
    },
    handleUpdate(row) {
      // this.temp = Object.assign({}, row) // copy obj
      this.temp = { ...row } // copy obj
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
          updateUser(tempData)
            .then(response => {
              if (response.code === 200) {
                this.dialogFormVisible = false
                this.getList()
                this.$notify({
                  title: '成功',
                  message: '保存成功',
                  type: 'success',
                  duration: 2000
                })
              }
            })
            .catch(err => {
              console.log(err)
              // this.$notify.error({
              //   title: '失败',
              //   message: err.message,
              //   duration: 2000
              // })
            })
        }
      })
    },
    handleModifyPassword(row) {
      this.modifyPassword.id = row.id // copy obj
      this.dialogFormPasswordVisible = true
      this.$nextTick(() => {
        this.$refs['dataModifyForm'].clearValidate()
      })
    },
    postModifyPassword() {
      this.$refs['dataModifyForm'].validate(valid => {
        if (valid) {
          const tempData = Object.assign({}, this.modifyPassword)
          modifyPassword(tempData).then(response => {
            if (response.code === 200) {
              this.dialogFormPasswordVisible = false
              this.$notify({
                title: '成功',
                message: response.message,
                type: 'success',
                duration: 2000
              })
            } else {
              this.$notify.error({
                title: '失败',
                message: response.message,
                duration: 2000
              })
            }
          })
        }
      })
    },
    handleDelete(row) {
      deleteUser(row.id).then(response => {
        if (response.code === 200) {
          this.getList()
          this.$notify({
            title: '成功',
            message: response.message,
            type: 'success',
            duration: 2000
          })
        } else {
          this.$notify.error({
            title: '失败',
            message: response.message,
            duration: 2000
          })
        }
      })
    },
    handleInsertByUserId(selectCurentUserId, roleIds) {
      var idsStr = roleIds.join(',')
      insertByUserId(selectCurentUserId, idsStr).then(response => {
        if (response.code === 200) {
          this.$notify({
            title: '成功',
            message: '设置成功',
            type: 'success',
            duration: 2000
          })
        } else {
          this.$notify.error({
            title: '失败',
            message: response.message,
            duration: 2000
          })
        }
      })
    },
    handleDeleteByUserId(selectCurentUserId, roleIds) {
      var idsStr = roleIds.join(',')
      deleteByUserId(selectCurentUserId, idsStr).then(response => {
        if (response.code === 200) {
          this.$notify({
            title: '成功',
            message: '撤回成功',
            type: 'success',
            duration: 2000
          })
        } else {
          this.$notify.error({
            title: '失败',
            message: response.message,
            duration: 2000
          })
        }
      })
    },
    handleDownload() {
      this.downloadLoading = false
      console.log(this.listQuery)
      exportUser(this.listQuery).then(response => {
        this.downloadLoading = true
        if (response.code === 200) {
          import('@/vendor/Export2Excel').then(excel => {
            const tHeader = ['姓名', '用户名', '联系电话', '邮箱']
            const filterVal = ['realName', 'userName', 'phone', 'email']
            const data = this.formatJson(filterVal, response.data)
            excel.export_json_to_excel({
              header: tHeader, // 表头 必填
              data, // 具体数据 必填
              filename: 'excel-list', // 非必填
              autoWidth: true, // 非必填
              bookType: 'xlsx' // 非必填
            })
            this.downloadLoading = false
          })
        } else {
          this.$notify.error({
            title: '失败',
            message: response.data.errmsg,
            duration: 2000
          })
        }
      })
    },
    formatJson(filterVal, jsonData) {
      return jsonData.map(v => filterVal.map(j => {
        if (j === 'timestamp') {
          return parseTime(v[j])
        } else {
          return v[j]
        }
      }))
    },
    toAssignRoles(row) {
      this.selectCurentUserId = row.id
      this.dialogFormRolesVisible = true
      this.getUserRoleIds(this.selectCurentUserId)
    },
    handleChangeRoles(value, direction, movedKeys) {
      if (direction === 'left') {
        this.handleDeleteByUserId(this.selectCurentUserId, movedKeys)
      } else {
        this.handleInsertByUserId(this.selectCurentUserId, movedKeys)
      }
    }
  }
}
</script>
