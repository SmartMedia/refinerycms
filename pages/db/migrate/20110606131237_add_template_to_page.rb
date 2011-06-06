class AddTemplateToPage < ActiveRecord::Migration
  def self.up
    add_column :pages, :template, :string, :default => nil
  end

  def self.down
    remove_column :pages, :template
  end
end
