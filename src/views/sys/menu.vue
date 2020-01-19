<template>
  <div class="app-container calendar-list-container">
    <div class="filter-container">
      <el-input v-model="listQuery.keyword" style="width: 200px;" class="filter-item" placeholder="请输入菜单名称" @keyup.enter.native="handleFilter" />
      <el-button v-waves class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">查询</el-button>
      <el-button class="filter-item" style="margin-left: 10px;" type="primary" icon="el-icon-edit" @click="handleCreate">添加</el-button>
    </div>

    <el-table :data="list" :async="false" row-key="id" border>
      <el-table-column width="150" label="名称">
        <template slot-scope="scope">
          <span style="color:sandybrown">{{ scope.row.name }}</span>
        </template>
      </el-table-column>
      <el-table-column width="150" label="前端地址">
        <template slot-scope="scope">
          <span>{{ scope.row.path }}</span>
        </template>
      </el-table-column>
      <el-table-column width="150" label="授权编号">
        <template slot-scope="scope">
          <span>{{ scope.row.permission }}</span>
        </template>
      </el-table-column>
      <el-table-column width="80" align="center" label="排序">
        <template slot-scope="scope">
          <el-input v-model="scope.row.sort" size="mini" @change="handleChangeSort(scope.row.id, scope.row.sort)" />
        </template>
      </el-table-column>
      <el-table-column width="100" label="图标">
        <template slot-scope="scope">
          <span>{{ scope.row.icon }}</span>
        </template>
      </el-table-column>
      <el-table-column width="100" align="center" label="是否可用">
        <template slot-scope="scope">
          <span v-if="scope.row.enabled==0" style="color:red;">停用</span>
          <span v-if="scope.row.enabled==1" style="color:green;">启用</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" fixed="right" align="center" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button type="primary" size="mini" @click="handleUpdate(scope.row)">编辑</el-button>
          <el-button size="mini" type="danger" @click="handleDelete(scope.row)">删除</el-button>
          <el-button v-if="scope.row.type == '2'" type="primary" size="mini" style="width: 100px;" @click="handleGenerateButton(scope.row)">生成按钮</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible" width="50%">
      <el-form ref="dataForm" :rules="rules" :model="temp" label-position="left" label-width="120px" style="width: 90%; margin-left:50px;">

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="权限类型" prop="type">
              <el-radio
                v-for="item in menuTypeDict"
                :key="'type' + item.label"
                v-model="temp.type"
                :label="item.value"
              >
                {{ item.label }}
              </el-radio>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="是否可用" prop="enabled">
              <el-radio
                v-for="item in enabledDict"
                :key="'enabled' + item.label"
                v-model="temp.enabled"
                :label="item.bValue"
              >
                {{ item.label }}
              </el-radio>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="菜单名称" prop="name">
              <el-input v-model="temp.name" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="上级菜单" prop="parentId">
              <el-cascader
                v-model="temp.parentIds"
                :options="list"
                :props="treeProps"
                :show-all-levels="false"
                label="name"
                change="handelChangeParentId"
                clearable
              />
            </el-form-item>
          </el-col>

        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="权限编号" prop="permission">
              <el-input v-model="temp.permission" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="前端地址" prop="path">
              <el-input v-model="temp.path" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="前端组件" prop="component">
              <el-input v-model="temp.component" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="图标" prop="icon">
              <el-input v-model="temp.icon" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="排序" prop="sort">
              <el-input v-model="temp.sort" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="备注">
          <el-input v-model="temp.remarks" :autosize="{ minRows: 2, maxRows: 4}" type="textarea" placeholder="请填写备注" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">取消</el-button>
        <el-button v-if="dialogStatus=='create'" type="primary" @click="createData">保存</el-button>
        <el-button v-else type="primary" @click="updateData">保存</el-button>
      </div>
    </el-dialog>

    <el-dialog :visible.sync="generateButtonDialogFormVisible" title="生成按钮" width="60%">
      <el-form ref="generateButtonDataForm" :rules="generateButtonRules" :model="generateButtonTemp" label-position="left" label-width="120px" style="width: 90%; margin-left:50px;">
        <el-alert
          title="生成按钮操作执行后，会删除以前菜单下面的所有按钮，请谨慎操作"
          type="warning"
          style="margin-bottom: 20px;"
          show-icon
        />
        <el-form-item label="父级权限" prop="parentPermission">
          <el-input v-model="generateButtonTemp.parentPermission" />
        </el-form-item>
        <el-form-item label="权限" prop="permission">
          <el-checkbox-group v-model="generateButtonTemp.permission">
            <el-checkbox v-for="item in buttonInit" :key="item.permission" :label="item.permission">
              {{ item.title }}
            </el-checkbox>
          </el-checkbox-group>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="generateButtonDialogFormVisible = false">取消</el-button>
        <el-button type="primary" @click="generateButton">保存</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { getMenus, createMenu, deleteMenu, updateMenu, changeSort, generateButton } from '@/api/sys/menu'
import waves from '@/directive/waves' // 水波纹指令
import { enabledDict, menuTypeDict } from '@/utils/dict'
// import treeTable from '@/components/TreeTable'

const defaultMenu = {
  id: null,
  name: '',
  parentId: null,
  parentIds: [],
  type: 2,
  path: '',
  url: '',
  enabled: true,
  sort: '0',
  icon: '',
  edirect: '',
  cacheable: 'true',
  requireAuth: 'true',
  component: '',
  remark: ''
}

export default {
  name: 'MenuComponent',
  directives: {
    waves
  },
  //   components: { treeTable },
  data() {
    return {
      rowkey: 'path',
      expandAll: false,
      tableKey: 0,
      list: [],
      total: null,
      listLoading: true,
      treeProps: {
        value: 'id',
        label: 'name',
        checkStrictly: true
      },
      enabledDict: enabledDict,
      menuTypeDict: menuTypeDict,
      treeSelectedOptions: [],
      listQuery: {
        keyword: '',
        importance: undefined,
        title: undefined,
        type: undefined,
        sort: '+id'
      },
      showReviewer: false,
      temp: defaultMenu,
      dialogFormVisible: false,
      dialogStatus: '',
      textMap: {
        update: '修改菜单',
        create: '添加菜单'
      },
      dialogPvVisible: false,
      pvData: [],
      rules: {
        type: [{ required: true, message: '菜单名称必填', trigger: 'change' }],
        name: [{ required: true, message: '菜单名称必填', trigger: 'blur' }],
        permission: [{ required: true, message: '权限编号必填', trigger: 'blur' }],
        enabled: [{ required: true, message: '是否可用必选', trigger: 'change' }],
        sort: [{ required: true, message: '排序必填', trigger: 'blur' }],
        cacheable: [{ required: true, message: '是否缓存必选', trigger: 'change' }],
        requireAuth: [{ required: true, message: '是否需要认证必选', trigger: 'change' }]
      },
      downloadLoading: false,
      permissionTreeList: null,
      permissionQuery: {
        sort: '+id'
      },
      buttonInit: [
        {
          title: '查询',
          permission: 'list'
        },
        {
          title: '添加',
          permission: 'add'
        },
        {
          title: '更新',
          permission: 'update'
        },
        {
          title: '删除',
          permission: 'delete'
        },
        {
          title: '导出',
          permission: 'export'
        },
        {
          title: '导入',
          permission: 'import'
        }
      ],
      generateButtonTemp: {
        menuId: undefined,
        permission: [],
        parentPermission: ''
      },
      generateButtonDialogFormVisible: false,
      generateButtonRules: {
        parentPermission: [{ required: true, message: '父级权限必填', trigger: 'blur' }],
        permission: [{ required: true, message: '请选择权限', trigger: 'change' }]
      }
    }
  },
  created() {
    this.getList()
  },
  methods: {
    getList() {
      this.listLoading = true
      getMenus(this.listQuery).then(response => {
        this.list = response.data
        this.listLoading = false
      })
    },
    changeRequireAuth() {

    },
    handleFilter() {
      this.getList()
    },
    resetTemp() {
      this.temp = { ...defaultMenu } // 复制对象 等同 Object.assign({},defaultMenu)
      this.treeSelectedOptions.length = 0
    },
    resetGenerateButtonTemp(row) {
      this.generateButtonTemp = {
        menuId: row.id,
        permission: [],
        parentPermission: ''
      }
    },
    handleChangeSort(rowId, value) {
      changeSort(rowId, value).then(response => {
        if (response.code === 200) {
          this.$notify({
            title: '成功',
            message: response.message,
            type: 'success',
            duration: 2000
          })
          // this.getList()
        } else {
          this.$notify.error({
            title: '失败',
            message: response.message,
            duration: 2000
          })
        }
      })
    },
    handelChangeParentId(nodel) {
      console.log(nodel)
    },
    handleCreate() {
      this.resetTemp()
      this.dialogStatus = 'create'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs.dataForm.clearValidate()
      })
    },
    createData() {
      // 预处理提交的数据
      const parentIds = this.temp.parentIds
      if (parentIds !== undefined && parentIds !== '') {
        if (parentIds instanceof Array && parentIds.length > 0) {
          const parentId = parentIds[parentIds.length - 1]
          this.temp.parentId = parentId
        }
      }

      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          if (this.temp.parentIds !== undefined && this.temp.parentIds !== '') {
            this.temp.parentIds = this.temp.parentIds.join('/')
          }
          createMenu(this.temp).then((response) => {
            if (response.code === 200) {
              this.dialogFormVisible = false
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
        }
      })
    },
    handleUpdate(row) {
      this.resetTemp()
      this.temp = Object.assign({}, row) // copy obj
      //   if (this.temp.children) {
      //     this.temp.children.length = 0
      //   }
      if (this.temp.parentIds) {
        let parentIds = this.temp.parentIds.trim()
        if (parentIds.endsWith('\/')) {
          parentIds = parentIds.substr(0, parentIds.length - 1)
        }
        this.temp.parentIds = parentIds.split('\/')
      }

      this.dialogStatus = 'update'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    //   this.$refs.cascader.clearCheckedNodes()
    },
    updateData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          const parentIds = this.temp.parentIds
          if (parentIds && parentIds !== '') {
            if (parentIds instanceof Array && parentIds.length > 0) {
              const parentId = parentIds[parentIds.length - 1]
              this.temp.parentId = parentId
            }
          }
          if (this.temp.parentIds !== undefined && this.temp.parentIds !== '') {
            this.temp.parentIds = this.temp.parentIds.join('/')
          }

          const tempData = Object.assign({}, this.temp)
          updateMenu(tempData).then((response) => {
            if (response.code === 200) {
              this.getList()
              this.dialogFormVisible = false
              this.$notify({
                title: '成功',
                message: '更新成功',
                type: 'success',
                duration: 2000
              })
            } else {
              this.$notify({
                title: '失败',
                message: response.message,
                type: 'error',
                duration: 2000
              })
            }
          })
        }
      })
    },
    handleDelete(row) {
      this.$confirm('确认要删除菜单么?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        deleteMenu(row.id).then(response => {
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
    handleGenerateButton(row) {
      this.resetGenerateButtonTemp(row)
      this.generateButtonDialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['generateButtonDataForm'].clearValidate()
      })
    },
    generateButton() {
      this.$refs['generateButtonDataForm'].validate((valid) => {
        if (valid) {
          const permissionTitle = []
          this.generateButtonTemp.permission.forEach((permission, permissionIndex) => {
            this.buttonInit.forEach((item, index) => {
              if (permission === item.permission) {
                permissionTitle[permissionIndex] = item.title
              }
            })
          })
          this.generateButtonTemp.permissionTitles = permissionTitle.join(',')
          this.generateButtonTemp.permissions = this.generateButtonTemp.permission.join(',')
          generateButton(this.generateButtonTemp).then((response) => {
            if (response.code === 200) {
              this.getList()
              this.generateButtonDialogFormVisible = false
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
    }
  }
}
</script>
