class AddSlugUrlToPagesTranslation < ActiveRecord::Migration
  def self.up
    add_column :page_translations, :slug_url, :string unless Page::Translation.column_names.include?('slug_url')
  end

  def self.down
    remove_column :page_translations, :slug_url unless Page::Translation.column_names.include?('slug_url')
  end
end
