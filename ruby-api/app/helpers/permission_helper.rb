class PermissionHelper
  def self.flatten_permission_meta(meta)
    flat_items = [meta]
    if meta['children']
      meta['children'].each do |child|
        flat_items = flat_items.concat(self.flatten_permission_meta(child))
      end
    end
    flat_items
  end
end
