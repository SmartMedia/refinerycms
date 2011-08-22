require 'spec_helper'
require Rails.root.join('generators', 'lib', 'generators', 'refinery', 'engine', 'engine_generator').to_s

describe Refinery::EngineGenerator do
  before(:each) do
    @engine_name = 'rspec_product_test'
    @engine_path = Rails.root.join('vendor', 'engines', "#{@engine_name}s")
  end

  after(:each) do
    FileUtils.rm_rf(@engine_path)
  end

  def generate_refinery_engine_with_args(arguments)
    generator = ::Refinery::EngineGenerator.new(arguments.split(" "))
    generator.options = {:quiet => true}
    generator.generate
  end

  describe "standard generator" do
    it "should generate engine" do
      generate_refinery_engine_with_args("#{@engine_name} title:string description:text image:image brochure:resource")
      File.exist?(Rails.root.join(@engine_path)).should be_true
    end
  end
end
