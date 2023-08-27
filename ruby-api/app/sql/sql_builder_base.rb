class SqlBuilderBase
  attr_accessor :table

  @condition_columns
  @condition_values

  def initialize
    @condition_columns = []
    @condition_values = []
  end

  def check_table_valid
    raise StandardError.new 'table missing.' if table.nil? || table.empty?
  end

  def add_special_condition(condition, args = [])
    raise StandardError.new 'addSpecialCondition: Incorrect number of arguments.' unless condition.scan(/\?/).length == args.length
    @condition_columns.push("(#{condition})")
    @condition_values = @condition_values.concat(args)
    self
  end

  def add_condition_kv(key, value)
    key = "`#{key}`" if key.match(/^\w+$/)
    add_special_condition("#{key} = ?", [value])
    self
  end

  def add_condition_like_keywords(key, keywords)
    key = "`#{key}`" if key.match(/^\w+$/)
    add_special_condition("#{key} LIKE ?", ["%#{keywords}%"])
    self
  end

  def add_condition_key_in_array(key, values)
    if values.length == 0
      add_special_condition('1 = 0')
      return self
    end
    key = "`#{key}`" if key.match(/^\w+$/)
    quotes = Array.new(values.length).fill('?').join(', ')
    add_special_condition("#{key} IN (#{quotes})", values)
    self
  end

  def add_condition_key_not_in_array(key, values)
    if values.length == 0
      add_special_condition('1 = 0')
      return self
    end
    key = "`#{key}`" if key.match(/^\w+$/)
    quotes = Array.new(values.length).fill('?').join(', ')
    add_special_condition("#{key} NOT IN (#{quotes})", values)
    self
  end

  def build_condition_str
    @condition_columns.join(' AND ')
  end

  def build_filled_condition_str
    puts build_condition_str
    puts @condition_values
    build_condition_str.gsub(/\?/).with_index { |m, i| ActiveRecord::Base.connection.quote(@condition_values[i]) }
  end
end
