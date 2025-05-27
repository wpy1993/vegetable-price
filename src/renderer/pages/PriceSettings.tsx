import React, { useState, useEffect } from 'react'

interface PriceItem {
  id: number
  name: string
  price: number
}

const PriceSettings: React.FC = () => {
  const [items, setItems] = useState<PriceItem[]>([])
  const [newItem, setNewItem] = useState({ name: '', price: '' })
  const [editingId, setEditingId] = useState<number | null>(null)

  // 模拟远程数据读取
  const readDataFromRemote = async () => {
    // TODO: 实现远程数据读取
    return []
  }

  // 模拟远程数据保存
  const setDataToRemote = async (data: PriceItem[]) => {
    // TODO: 实现远程数据保存
  }

  useEffect(() => {
    readDataFromRemote().then(data => setItems(data))
  }, [])

  const handleAdd = async () => {
    if (!newItem.name || !newItem.price) return

    const newData = [...items, {
      id: Date.now(),
      name: newItem.name,
      price: Number(newItem.price)
    }]

    await setDataToRemote(newData)
    setItems(newData)
    setNewItem({ name: '', price: '' })
  }

  const handleDelete = async (id: number) => {
    const newData = items.filter(item => item.id !== id)
    await setDataToRemote(newData)
    setItems(newData)
  }

  const handleEdit = async (id: number, newName: string, newPrice: string) => {
    const newData = items.map(item =>
      item.id === id
        ? { ...item, name: newName, price: Number(newPrice) }
        : item
    )
    await setDataToRemote(newData)
    setItems(newData)
    setEditingId(null)
  }

  return (
    <div className="price-settings">
      <h2>设置默认价格</h2>

      <div className="add-form">
        <input
          type="text"
          placeholder="菜品名称"
          value={newItem.name}
          onChange={e => setNewItem(prev => ({ ...prev, name: e.target.value }))}
        />
        <input
          type="number"
          placeholder="价格"
          value={newItem.price}
          onChange={e => setNewItem(prev => ({ ...prev, price: e.target.value }))}
        />
        <button onClick={handleAdd}>添加</button>
      </div>

      <table>
        <thead>
          <tr>
            <th>菜品名称</th>
            <th>价格</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          {items.map(item => (
            <tr key={item.id}>
              <td>
                {editingId === item.id ? (
                  <input
                    type="text"
                    defaultValue={item.name}
                    id={`name-${item.id}`}
                  />
                ) : (
                  item.name
                )}
              </td>
              <td>
                {editingId === item.id ? (
                  <input
                    type="number"
                    defaultValue={item.price}
                    id={`price-${item.id}`}
                  />
                ) : (
                  item.price
                )}
              </td>
              <td>
                {editingId === item.id ? (
                  <button
                    onClick={() => {
                      const nameInput = document.getElementById(`name-${item.id}`) as HTMLInputElement
                      const priceInput = document.getElementById(`price-${item.id}`) as HTMLInputElement
                      handleEdit(item.id, nameInput.value, priceInput.value)
                    }}
                  >
                    保存
                  </button>
                ) : (
                  <>
                    <button onClick={() => setEditingId(item.id)}>编辑</button>
                    <button onClick={() => handleDelete(item.id)}>删除</button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default PriceSettings 