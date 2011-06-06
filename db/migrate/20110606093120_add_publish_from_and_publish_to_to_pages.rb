class AddPublishFromAndPublishToToPages < ActiveRecord::Migration
  def self.up
    add_column :pages, :publish_from, :datetime, :default => nil
    add_column :pages, :publish_to, :datetime, :default => nil
  end

  def self.down
    remove_column :pages, :publish_to
    remove_column :pages, :publish_from
  end
end
